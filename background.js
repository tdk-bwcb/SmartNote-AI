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
    try {
      chrome.contextMenus.create({
        id: menu.id,
        title: menu.title,
        contexts: menu.contexts
      });
    } catch (err) {
      console.warn('contextMenus.create failed for', menu.id, err);
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error('tabs.query error:', chrome.runtime.lastError);
      return;
    }
    const target = tabs && tabs[0];
    if (!target || !target.id) return;
    chrome.tabs.sendMessage(target.id, {
      action: info.menuItemId,
      text: selectedText
    }, (resp) => {
      if (chrome.runtime.lastError) {
        console.warn('tabs.sendMessage (context menu) failed:', chrome.runtime.lastError.message);
      }
    });
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
    // If `window.ai` is available here (unlikely in a service worker), use it.
    if (typeof window !== 'undefined' && window.ai && window.ai.languageModel) {
      const session = await window.ai.languageModel.create();
      try {
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
          default:
            throw new Error('Unknown AI action: ' + action);
        }

        const result = await session.prompt(prompt);
        return { output: result };
      } finally {
        // Ensure sessions are cleaned up
        if (session && typeof session.destroy === 'function') {
          try { await session.destroy(); } catch (e) { console.warn('Failed to destroy AI session', e); }
        }
      }
    }

    // Fallback: attempt to delegate AI call to the active tab's page context
    return await delegateAiToActiveTab(action, text, param);
  } catch (error) {
    console.error('AI Processing Error:', error);
    throw error;
  }
}

// Delegate AI processing to the active tab. Content script will attempt to access page's window.ai
function delegateAiToActiveTab(action, text, param) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(new Error('tabs.query failed: ' + chrome.runtime.lastError.message));
      }
      const tab = tabs && tabs[0];
      if (!tab || !tab.id) return reject(new Error('No active tab to delegate AI work'));

      chrome.tabs.sendMessage(tab.id, { action: 'runAI', aiAction: action, text, param }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error('tabs.sendMessage failed: ' + chrome.runtime.lastError.message));
        }
        if (!response) return reject(new Error('No response from content script'));
        if (response.success) return resolve({ output: response.output });
        return reject(new Error(response.error || 'Unknown error from content script'));
      });
    });
  });
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