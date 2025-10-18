/**
 * SmartNote AI - Background Service Worker
 * Manages context menus, message passing, and AI processing
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('✨ SmartNote AI installed');
  initContextMenus();
});

function initContextMenus() {
  const contextMenus = [
    { id: 'summarize', title: '📋 Summarize with AI', contexts: ['selection'] },
    { id: 'proofread', title: '✏️ Proofread', contexts: ['selection'] },
    { id: 'simplify', title: '🧠 Simplify Concept', contexts: ['selection'] },
    { id: 'translate', title: '🌍 Translate', contexts: ['selection'] },
    { id: 'rephrase', title: '🔄 Rephrase', contexts: ['selection'] }
  ];

  contextMenus.forEach(menu => {
    chrome.contextMenus.create({
      id: menu.id,
      title: menu.title,
      contexts: menu.contexts
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: info.menuItemId,
      text: selectedText
    }).catch(err => console.log('Message delivery:', err));
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      let result = {};
      
      switch(request.action) {
        case 'summarize':
          result = await processWithAI('summarize', request.text);
          break;
        case 'proofread':
          result = await processWithAI('proofread', request.text);
          break;
        case 'rephrase':
          result = await processWithAI('rephrase', request.text, request.tone);
          break;
        case 'translate':
          result = await processWithAI('translate', request.text, request.language);
          break;
        case 'simplify':
          result = await processWithAI('simplify', request.text);
          break;
        case 'saveNote':
          result = await saveNoteToStorage(request.note);
          break;
        case 'getNotes':
          result = await getNotesFromStorage();
          break;
        case 'deleteNote':
          result = await deleteNoteFromStorage(request.id);
          break;
      }
      
      sendResponse({ success: true, data: result });
    } catch (error) {
      console.error('Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true;
});

async function processWithAI(action, text, param = null) {
  try {
    if (!window.ai || !window.ai.languageModel) {
      throw new Error('AI API not available. Enable Chrome Experimental Features in chrome://flags');
    }

    const session = await window.ai.languageModel.create();
    let prompt = '';

    switch(action) {
      case 'summarize':
        prompt = `Summarize the following text concisely in 2-3 sentences:\n\n${text}`;
        break;
      case 'proofread':
        prompt = `Proofread and fix grammar/spelling errors. Return only the corrected text:\n\n${text}`;
        break;
      case 'rephrase':
        const toneMap = { professional: 'professional', academic: 'academic', friendly: 'casual' };
        const tone = toneMap[param] || 'casual';
        prompt = `Rephrase this text in a ${tone} tone:\n\n${text}`;
        break;
      case 'translate':
        const lang = param || 'Spanish';
        prompt = `Translate this text to ${lang}. Return only the translation:\n\n${text}`;
        break;
      case 'simplify':
        prompt = `Explain this concept in simple terms a 15-year-old would understand:\n\n${text}`;
        break;
    }

    const result = await session.prompt(prompt);
    await session.destroy();
    return { output: result };
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw error;
  }
}

async function saveNoteToStorage(note) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const notes = result.notes || [];
      const newNote = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...note
      };
      notes.push(newNote);
      chrome.storage.local.set({ notes }, () => {
        resolve(newNote);
      });
    });
  });
}

async function getNotesFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      resolve(result.notes || []);
    });
  });
}

async function deleteNoteFromStorage(id) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const notes = (result.notes || []).filter(note => note.id !== id);
      chrome.storage.local.set({ notes }, () => {
        resolve({ success: true });
      });
    });
  });
}