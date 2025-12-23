// LinkedIn Saved Posts Organizer - Popup Script

const SAVED_POSTS_URL = 'https://www.linkedin.com/my-items/saved-posts/';
const STORAGE_KEY_ENABLED = 'extension_enabled';

// Get DOM elements
const gotoButton = document.getElementById('gotoSavedPosts');
const toggleCheckbox = document.getElementById('toggleExtension');
const statusText = document.getElementById('statusText');

// Load current state
async function loadState() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY_ENABLED]);
        const isEnabled = result[STORAGE_KEY_ENABLED] !== false; // Default to true

        toggleCheckbox.checked = isEnabled;
        updateStatusText(isEnabled);
    } catch (error) {
        console.error('Error loading state:', error);
        toggleCheckbox.checked = true;
        updateStatusText(true);
    }
}

// Update status text
function updateStatusText(isEnabled) {
    if (isEnabled) {
        statusText.textContent = '✓ Extension is Active';
        statusText.className = 'status-text active';
    } else {
        statusText.textContent = '○ Extension is Inactive';
        statusText.className = 'status-text inactive';
    }
}

// Handle "Go to Saved Posts" button click
gotoButton.addEventListener('click', async () => {
    try {
        await chrome.tabs.create({ url: SAVED_POSTS_URL });
        window.close();
    } catch (error) {
        console.error('Error opening saved posts:', error);
    }
});

// Handle toggle switch
toggleCheckbox.addEventListener('change', async (e) => {
    const isEnabled = e.target.checked;

    try {
        // Save state
        await chrome.storage.local.set({ [STORAGE_KEY_ENABLED]: isEnabled });

        // Update UI
        updateStatusText(isEnabled);

        // Notify background script to update badge
        chrome.runtime.sendMessage({
            action: 'updateState',
            enabled: isEnabled
        });

        // If enabled and on LinkedIn, show the panel
        if (isEnabled) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('linkedin.com')) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleExtension',
                    enabled: true
                }).catch(() => {
                    // Tab might not have content script yet, that's okay
                });
            }
        } else {
            // If disabled, hide the panel
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('linkedin.com')) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleExtension',
                    enabled: false
                }).catch(() => {
                    // Tab might not have content script yet, that's okay
                });
            }
        }
    } catch (error) {
        console.error('Error toggling extension:', error);
    }
});

// Initialize
loadState();
