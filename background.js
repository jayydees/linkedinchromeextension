// LinkedIn Saved Posts Organizer - Background Service Worker

const STORAGE_KEY_ENABLED = 'extension_enabled';

// Update badge text on icon
async function updateBadge() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY_ENABLED]);
        const isEnabled = result[STORAGE_KEY_ENABLED] !== false; // Default to true

        if (isEnabled) {
            chrome.action.setBadgeText({ text: 'ON' });
            chrome.action.setBadgeBackgroundColor({ color: '#0A66C2' });
        } else {
            chrome.action.setBadgeText({ text: 'OFF' });
            chrome.action.setBadgeBackgroundColor({ color: '#999999' });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('LinkedIn Organizer: Extension installed/updated');

    // Set default state to enabled
    const result = await chrome.storage.local.get([STORAGE_KEY_ENABLED]);
    if (result[STORAGE_KEY_ENABLED] === undefined) {
        await chrome.storage.local.set({ [STORAGE_KEY_ENABLED]: true });
    }

    // Update badge
    await updateBadge();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateState') {
        updateBadge();
    }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY_ENABLED]) {
        updateBadge();
    }
});

// Update badge on startup
updateBadge();
