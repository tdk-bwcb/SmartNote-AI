/**
 * SmartNote AI - Content Script
 * Runs in the context of web pages
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize' || request.action === 'proofread' || 
      request.action === 'simplify' || request.action === 'translate' || 
      request.action === 'rephrase') {
    
    showNotification('Processing with AI...');
    
    chrome.runtime.sendMessage({
      action: request.action,
      text: request.text
    }, (response) => {
      if (response && response.success) {
        showNotification(`✅ ${request.action} complete!`);
      } else {
        showNotification('❌ Error processing text');
      }
    });
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