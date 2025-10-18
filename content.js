/**
 * SmartNote AI - Content Script
 * Runs in the context of web pages
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle delegated AI runs from the background service worker
  if (request.action === 'runAI') {
    const aiAction = request.aiAction;
    const text = request.text;
    const param = request.param;

    showNotification('Processing with AI...');

    // Inject a small script to run in page context so it can access window.ai
    const injectedCode = `
      (async function() {
        try {
          if (!window.ai || !window.ai.languageModel) {
            return window.__SMARTNOTE_AI_RESULT = { success: false, error: 'window.ai not available on page' };
          }
          const session = await window.ai.languageModel.create();
          try {
            let prompt = '';
            switch(${JSON.stringify(aiAction)}) {
              case 'summarize': prompt = \`Summarize the following text concisely in 2-3 sentences:\n\n\${JSON.stringify(text).slice(1,-1)}\`; break;
              case 'proofread': prompt = \`Proofread and fix grammar/spelling errors. Return only the corrected text:\n\n\${JSON.stringify(text).slice(1,-1)}\`; break;
              case 'rephrase': {
                const toneMap = { professional: 'professional', academic: 'academic', friendly: 'casual' };
                const tone = toneMap[${JSON.stringify(param)}] || 'casual';
                prompt = \`Rephrase this text in a \${tone} tone:\n\n\${JSON.stringify(text).slice(1,-1)}\`; break;
              }
              case 'translate': {
                const lang = ${JSON.stringify(param || 'Spanish')};
                prompt = \`Translate this text to \${lang}. Return only the translation:\n\n\${JSON.stringify(text).slice(1,-1)}\`; break;
              }
              case 'simplify': prompt = \`Explain this concept in simple terms a 15-year-old would understand:\n\n\${JSON.stringify(text).slice(1,-1)}\`; break;
              default: return window.__SMARTNOTE_AI_RESULT = { success: false, error: 'Unknown AI action' };
            }
            const output = await session.prompt(prompt);
            return window.__SMARTNOTE_AI_RESULT = { success: true, output };
          } finally {
            if (session && typeof session.destroy === 'function') {
              try { await session.destroy(); } catch(e) { /* ignore */ }
            }
          }
        } catch (err) {
          return window.__SMARTNOTE_AI_RESULT = { success: false, error: String(err) };
        }
      })();
    `;

    const script = document.createElement('script');
    script.textContent = injectedCode;
    (document.head || document.documentElement).appendChild(script);

    // Poll for result set by injected script
    const start = Date.now();
    const timeout = 20000; // 20s
    (function poll() {
      if (window.__SMARTNOTE_AI_RESULT) {
        const result = window.__SMARTNOTE_AI_RESULT;
        try { delete window.__SMARTNOTE_AI_RESULT; } catch(e) {}
        script.remove();
        if (result.success) {
          showNotification('✅ AI complete');
          sendResponse({ success: true, output: result.output });
        } else {
          showNotification('❌ AI error');
          sendResponse({ success: false, error: result.error || 'AI failed' });
        }
        return;
      }
      if (Date.now() - start > timeout) {
        script.remove();
        showNotification('❌ AI timeout');
        sendResponse({ success: false, error: 'AI timed out' });
        return;
      }
      setTimeout(poll, 200);
    })();

    // Return true to indicate we'll call sendResponse asynchronously
    return true;
  }
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #323232;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);