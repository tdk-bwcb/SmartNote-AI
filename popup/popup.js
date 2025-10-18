/**
 * SmartNote AI - Popup Script
 * Manages UI interactions and communication with background script
 */

const elements = {
  inputText: document.getElementById('inputText'),
  charCount: document.getElementById('charCount'),
  toneSelect: document.getElementById('toneSelect'),
  summarizeBtn: document.getElementById('summarizeBtn'),
  proofreadBtn: document.getElementById('proofreadBtn'),
  rephraseBtn: document.getElementById('rephraseBtn'),
  simplifyBtn: document.getElementById('simplifyBtn'),
  translateBtn: document.getElementById('translateBtn'),
  outputSection: document.getElementById('outputSection'),
  outputText: document.getElementById('outputText'),
  copyBtn: document.getElementById('copyBtn'),
  saveBtn: document.getElementById('saveBtn'),
  loadingState: document.getElementById('loadingState'),
  dashboardBtn: document.getElementById('dashboardBtn'),
  themeToggle: document.getElementById('themeToggle')
};

let currentAction = null;
let currentResult = null;

loadTheme();

elements.inputText.addEventListener('input', updateCharCount);
elements.summarizeBtn.addEventListener('click', () => processText('summarize'));
elements.proofreadBtn.addEventListener('click', () => processText('proofread'));
elements.rephraseBtn.addEventListener('click', () => processText('rephrase'));
elements.simplifyBtn.addEventListener('click', () => processText('simplify'));
elements.translateBtn.addEventListener('click', () => processText('translate'));
elements.copyBtn.addEventListener('click', copyToClipboard);
elements.saveBtn.addEventListener('click', saveNote);
elements.dashboardBtn.addEventListener('click', openDashboard);
elements.themeToggle.addEventListener('click', toggleTheme);

function updateCharCount() {
  const count = elements.inputText.value.length;
  elements.charCount.textContent = Math.min(count, 5000);
  elements.inputText.value = elements.inputText.value.substring(0, 5000);
}

async function processText(action) {
  const text = elements.inputText.value.trim();
  
  if (!text) {
    alert('Please enter or select some text first.');
    return;
  }

  showLoading(true);
  setUIEnabled(false);
  currentAction = action;
  currentResult = null;

  try {
    const message = {
      action: action,
      text: text,
      tone: elements.toneSelect.value,
      language: 'Spanish'
    };

    try {
      chrome.runtime.sendMessage(message, (response) => {
        // runtime-level errors
        if (chrome.runtime.lastError) {
          showLoading(false);
          setUIEnabled(true);
          alert('Extension error: ' + chrome.runtime.lastError.message);
          return;
        }

        showLoading(false);
        setUIEnabled(true);

        if (response && response.success) {
          currentResult = response.data.output;
          displayResult(currentResult, action);
        } else {
          const errorMsg = response?.error || 'Unknown error occurred';
          alert(`Error: ${errorMsg}\n\nMake sure Chrome's built-in AI is enabled at chrome://flags`);
          console.error('AI Error:', errorMsg);
        }
      });
    } catch (err) {
      showLoading(false);
      setUIEnabled(true);
      alert('Failed to send message to background: ' + String(err));
    }
  } catch (error) {
    showLoading(false);
    setUIEnabled(true);
    alert('Error: ' + error.message);
  }
}

function setUIEnabled(enabled) {
  const actionButtons = [elements.summarizeBtn, elements.proofreadBtn, elements.rephraseBtn, elements.simplifyBtn, elements.translateBtn];
  actionButtons.forEach(b => { if (b) b.disabled = !enabled; });
}

function displayResult(result, action) {
  if (!result) {
    alert('No result returned from AI.');
    return;
  }

  elements.outputText.textContent = result;
  elements.outputSection.style.display = 'block';
  elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showLoading(show) {
  elements.loadingState.style.display = show ? 'flex' : 'none';
}

async function copyToClipboard() {
  if (!currentResult) return;

  try {
    await navigator.clipboard.writeText(currentResult);
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      elements.copyBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('Failed to copy to clipboard');
  }
}

function saveNote() {
  if (!currentResult || !currentAction) return;

  const note = {
    originalText: elements.inputText.value,
    result: currentResult,
    action: String(currentAction).toLowerCase(),
    tone: elements.toneSelect.value
  };

  chrome.runtime.sendMessage({ action: 'saveNote', note: note }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('saveNote sendMessage error:', chrome.runtime.lastError);
      alert('Failed to save note: ' + chrome.runtime.lastError.message);
      return;
    }
    if (response && response.success) {
      alert('\u2705 Note saved to SmartBoard!');
    } else {
      alert('\u274c Failed to save note');
    }
  });
}

function openDashboard() {
  chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/dashboard.html') });
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('smartnote-theme', isDark ? 'dark' : 'light');
  elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
  const saved = localStorage.getItem('smartnote-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    elements.themeToggle.textContent = '☀️';
  }
}