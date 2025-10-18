/**
 * SmartNote AI - Dashboard Script
 * Manages the SmartBoard view for saved notes
 */

const elements = {
  notesGrid: document.getElementById('notesGrid'),
  emptyState: document.getElementById('emptyState'),
  searchInput: document.getElementById('searchInput'),
  exportBtn: document.getElementById('exportBtn'),
  clearBtn: document.getElementById('clearBtn'),
  themeToggle: document.getElementById('themeToggle'),
  totalNotes: document.getElementById('totalNotes'),
  summarizeCount: document.getElementById('summarizeCount'),
  proofreadCount: document.getElementById('proofreadCount')
};

let allNotes = [];

loadTheme();
loadNotes();

elements.searchInput.addEventListener('input', filterNotes);
elements.exportBtn.addEventListener('click', exportNotes);
elements.clearBtn.addEventListener('click', clearAllNotes);
elements.themeToggle.addEventListener('click', toggleTheme);

/**
 * Load notes from Chrome storage
 */
async function loadNotes() {
  chrome.runtime.sendMessage({ action: 'getNotes' }, (response) => {
    if (response && response.success) {
      allNotes = response.data || [];
      renderNotes(allNotes);
      updateStats();
    }
  });
}

/**
 * Render notes to the grid
 */
function renderNotes(notes) {
  elements.notesGrid.innerHTML = '';

  if (notes.length === 0) {
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  notes.forEach(note => {
    const card = createNoteCard(note);
    elements.notesGrid.appendChild(card);
  });
}

/**
 * Create a note card element
 */
function createNoteCard(note) {
  const card = document.createElement('div');
  card.className = 'note-card';
  
  const date = new Date(note.timestamp);
  const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

  card.innerHTML = `
    <div class="note-header">
      <span class="note-badge">${note.action}</span>
      <span class="note-time">${timeStr}</span>
    </div>
    <div>
      <div class="note-label" style="font-weight: 600; font-size: 11px; margin-bottom: 4px;">Original:</div>
      <div class="note-original">${escapeHtml(note.originalText)}</div>
    </div>
    <div>
      <div class="note-label" style="font-weight: 600; font-size: 11px; margin-bottom: 4px;">Result:</div>
      <div class="note-result">${escapeHtml(note.result)}</div>
    </div>
    <div class="note-footer">
      <button class="note-btn note-btn-copy" data-id="${note.id}">📋 Copy</button>
      <button class="note-btn note-btn-delete" data-id="${note.id}">🗑️ Delete</button>
    </div>
  `;

  card.querySelector('.note-btn-copy').addEventListener('click', (e) => {
    copyNoteResult(note.result);
  });

  card.querySelector('.note-btn-delete').addEventListener('click', (e) => {
    deleteNote(note.id);
  });

  return card;
}

/**
 * Copy note result to clipboard
 */
async function copyNoteResult(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  } catch (error) {
    alert('Failed to copy');
  }
}

/**
 * Delete a note
 */
function deleteNote(id) {
  if (confirm('Delete this note?')) {
    chrome.runtime.sendMessage(
      { action: 'deleteNote', id: id },
      (response) => {
        if (response && response.success) {
          loadNotes();
        }
      }
    );
  }
}

/**
 * Filter notes by search query
 */
function filterNotes() {
  const query = elements.searchInput.value.toLowerCase();
  const filtered = allNotes.filter(note =>
    note.originalText.toLowerCase().includes(query) ||
    note.result.toLowerCase().includes(query) ||
    note.action.toLowerCase().includes(query)
  );
  renderNotes(filtered);
}

/**
 * Update statistics
 */
function updateStats() {
  elements.totalNotes.textContent = allNotes.length;
  elements.summarizeCount.textContent = allNotes.filter(n => n.action === 'summarize').length;
  elements.proofreadCount.textContent = allNotes.filter(n => n.action === 'proofread').length;
}

/**
 * Export notes as JSON
 */
function exportNotes() {
  if (allNotes.length === 0) {
    alert('No notes to export');
    return;
  }

  const dataStr = JSON.stringify(allNotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `smartnote-export-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Clear all notes
 */
function clearAllNotes() {
  if (confirm('Delete ALL notes? This cannot be undone.')) {
    chrome.storage.local.set({ notes: [] }, () => {
      loadNotes();
    });
  }
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('smartnote-theme', isDark ? 'dark' : 'light');
  elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

/**
 * Load theme preference
 */
function loadTheme() {
  const saved = localStorage.getItem('smartnote-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    elements.themeToggle.textContent = '☀️';
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}