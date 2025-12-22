// LinkedIn Saved Posts Organizer
console.log('🚀 LinkedIn Organizer: Extension loaded!');

const STORAGE_KEY = 'linkedin_posts_data';
let currentData = { labels: {}, pins: [], notes: {}, availableLabels: [] };
let activeFilter = null;
let isInitialized = false;

// Inject all styles via JavaScript - properly scoped to prevent spillover
function injectStyles() {
    if (document.getElementById('li-organizer-styles')) return;

    // Ensure document.head exists before injecting
    if (!document.head) {
        console.warn('Document head not ready, deferring style injection');
        setTimeout(injectStyles, 100);
        return;
    }

    const style = document.createElement('style');
    style.id = 'li-organizer-styles';
    style.type = 'text/css';

    // All styles are now scoped with #linkedin-organizer-panel or specific class prefixes
    const css = `
        #linkedin-organizer-panel {
            position: fixed !important;
            top: 80px !important;
            right: 20px !important;
            width: 360px !important;
            background: #fff !important;
            border: 1px solid rgba(0,0,0,.08) !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.1) !important;
            z-index: 999999 !important;
            font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
        
        #linkedin-organizer-panel * {
            box-sizing: border-box !important;
        }
        
        #linkedin-organizer-panel #organizer-header {
            background: #0a66c2 !important;
            color: #fff !important;
            padding: 16px !important;
            border-radius: 8px 8px 0 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            cursor: move !important;
            user-select: none !important;
        }
        
        #linkedin-organizer-panel #organizer-header-content {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
        }
        
        #linkedin-organizer-panel #organizer-header h3 {
            margin: 0 !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
            color: #fff !important;
        }
        
        #linkedin-organizer-panel #organizer-author {
            font-size: 11px !important;
            opacity: .9 !important;
            font-weight: 400 !important;
            color: #fff !important;
        }
        
        #linkedin-organizer-panel #organizer-content {
            padding: 16px !important;
            max-height: 500px !important;
            overflow-y: auto !important;
            background: #fff !important;
        }
        
        #linkedin-organizer-panel.minimized #organizer-content {
            display: none !important;
        }
        
        #linkedin-organizer-panel .organizer-section {
            margin-bottom: 20px !important;
        }
        
        #linkedin-organizer-panel .organizer-section > label {
            display: block !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-bottom: 8px !important;
            color: rgba(0,0,0,.9) !important;
        }
        
        #linkedin-organizer-panel .organizer-input {
            width: 100% !important;
            padding: 10px 12px !important;
            border: 1px solid rgba(0,0,0,.6) !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            box-sizing: border-box !important;
            font-family: inherit !important;
            background: #fff !important;
            color: #000 !important;
        }
        
        #linkedin-organizer-panel .organizer-input:focus {
            outline: 2px solid #0a66c2 !important;
            border-color: transparent !important;
        }
        
        #linkedin-organizer-panel .organizer-btn {
            background: #0a66c2 !important;
            color: #fff !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 24px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            margin-right: 8px !important;
            margin-top: 8px !important;
            font-family: inherit !important;
            transition: background .2s !important;
            display: inline-block !important;
        }
        
        #linkedin-organizer-panel .organizer-btn:hover {
            background: #004182 !important;
        }
        
        #linkedin-organizer-panel .organizer-btn.secondary {
            background: #fff !important;
            color: #0a66c2 !important;
            border: 1px solid #0a66c2 !important;
        }
        
        #linkedin-organizer-panel .organizer-btn.secondary:hover {
            background: rgba(112,181,249,.1) !important;
            border-color: #004182 !important;
            color: #004182 !important;
        }

        #linkedin-organizer-panel .go-to-saved-posts-btn {
            width: 100% !important;
            margin: 0 0 16px 0 !important;
            padding: 12px 20px !important;
            font-size: 15px !important;
            border-radius: 6px !important;
            background: #0a66c2 !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        #linkedin-organizer-panel .go-to-saved-posts-btn:hover {
            background: #004182 !important;
            box-shadow: 0 3px 6px rgba(0,0,0,0.15) !important;
        }

        #linkedin-organizer-panel .label-pills {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            margin-top: 8px !important;
            min-height: 24px !important;
        }
        
        #linkedin-organizer-panel .label-pill {
            background: #fff !important;
            color: #0a66c2 !important;
            border: 1px solid #0a66c2 !important;
            padding: 6px 14px !important;
            border-radius: 16px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            transition: all .15s !important;
        }
        
        #linkedin-organizer-panel .label-pill:hover {
            background: rgba(112,181,249,.1) !important;
        }
        
        #linkedin-organizer-panel .label-pill.active-filter {
            background: #0a66c2 !important;
            color: #fff !important;
        }
        
        #linkedin-organizer-panel .label-pill .remove {
            cursor: pointer !important;
            font-weight: 600 !important;
            font-size: 16px !important;
            margin-left: 4px !important;
        }
        
        #linkedin-organizer-panel .status-indicator {
            background: #dff0d8 !important;
            color: #3c763d !important;
            padding: 10px 12px !important;
            border-radius: 4px !important;
            font-size: 13px !important;
            margin-bottom: 16px !important;
            border: 1px solid #d6e9c6 !important;
            font-weight: 500 !important;
        }
        
        #linkedin-organizer-panel #toggle-panel {
            background: none !important;
            border: none !important;
            color: #fff !important;
            font-size: 20px !important;
            cursor: pointer !important;
            padding: 0 !important;
            width: 24px !important;
            height: 24px !important;
            line-height: 1 !important;
        }
        
        /* Post controls - using unique class names to avoid conflicts */
        .li-org-post-controls {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            background: #fff !important;
            border-radius: 8px !important;
            padding: 6px !important;
            box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.1) !important;
            display: flex !important;
            gap: 4px !important;
            z-index: 10 !important;
        }
        
        .li-org-control-btn {
            background: transparent !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 6px 10px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            line-height: 1 !important;
            transition: background .15s !important;
            color: #000 !important;
        }
        
        .li-org-control-btn:hover {
            background: rgba(0,0,0,.08) !important;
        }
        
        .li-org-control-btn.pinned {
            background: rgba(10,102,194,.1) !important;
        }
        
        .li-org-post-labels {
            margin-top: 8px !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            padding: 0 12px !important;
        }
        
        .li-org-label-tag {
            background: rgba(10,102,194,.1) !important;
            color: #0a66c2 !important;
            padding: 4px 10px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            font-weight: 600 !important;
            display: inline-block !important;
        }
        
        .li-org-post-note {
            margin: 8px 12px !important;
            padding: 10px 12px !important;
            background: #fff8e1 !important;
            border-left: 3px solid #ffc107 !important;
            font-size: 13px !important;
            color: rgba(0,0,0,.9) !important;
            border-radius: 2px !important;
            line-height: 1.4 !important;
        }
        
        /* Label modal - scoped styles */
        #li-org-label-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0,0,0,0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 1000000 !important;
            font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
        
        #li-org-label-modal .modal-content {
            background: white !important;
            border-radius: 8px !important;
            padding: 24px !important;
            max-width: 400px !important;
            width: 90% !important;
            max-height: 80vh !important;
            overflow-y: auto !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }
        
        #li-org-label-modal h3 {
            margin: 0 0 16px 0 !important;
            color: rgba(0,0,0,0.9) !important;
            font-size: 18px !important;
            font-weight: 600 !important;
        }
        
        #li-org-label-modal .modal-label-item {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 12px !important;
            background: #fff !important;
            border: 1px solid rgba(0,0,0,.15) !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: all .15s !important;
            margin-bottom: 8px !important;
        }
        
        #li-org-label-modal .modal-label-item:hover {
            background: rgba(0,0,0,.04) !important;
            border-color: #0a66c2 !important;
        }
        
        #li-org-label-modal .modal-label-item.selected {
            background: rgba(10,102,194,.08) !important;
            border-color: #0a66c2 !important;
            border-width: 2px !important;
        }
        
        #li-org-label-modal .label-checkbox {
            width: 20px !important;
            height: 20px !important;
            border: 2px solid #666 !important;
            border-radius: 3px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: 700 !important;
            color: #0a66c2 !important;
            flex-shrink: 0 !important;
        }
        
        #li-org-label-modal .modal-label-item.selected .label-checkbox {
            background: #0a66c2 !important;
            border-color: #0a66c2 !important;
            color: #fff !important;
        }
        
        #li-org-label-modal .modal-buttons {
            display: flex !important;
            gap: 8px !important;
            justify-content: flex-end !important;
            margin-top: 20px !important;
        }
        
        #li-org-label-modal .organizer-btn {
            background: #0a66c2 !important;
            color: #fff !important;
            border: none !important;
            padding: 10px 20px !important;
            border-radius: 24px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            transition: background .2s !important;
        }
        
        #li-org-label-modal .organizer-btn:hover {
            background: #004182 !important;
        }
        
        #li-org-label-modal .organizer-btn.secondary {
            background: #fff !important;
            color: #0a66c2 !important;
            border: 1px solid #0a66c2 !important;
        }
        
        #li-org-label-modal .organizer-btn.secondary:hover {
            background: rgba(112,181,249,.1) !important;
            border-color: #004182 !important;
            color: #004182 !important;
        }
    `;

    try {
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
        console.log('✅ LinkedIn Organizer: Styles injected successfully');
    } catch (error) {
        console.error('❌ LinkedIn Organizer: Failed to inject styles:', error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

async function getData() {
    return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            currentData = result[STORAGE_KEY] || { labels: {}, pins: [], notes: {}, availableLabels: [] };
            resolve(currentData);
        });
    });
}

async function saveData(data) {
    currentData = data;
    return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
}

function getPostId(element) {
    const link = element.querySelector('a[href*="/posts/"], a[href*="/feed/update/"]');
    if (link && link.href) {
        const match = link.href.match(/(?:posts|update)\/([^/?]+)/);
        if (match) return match[1];
    }
    const author = element.querySelector('.update-components-actor__name, [data-control-name="actor"]');
    const time = element.querySelector('time');
    if (author && time) {
        const id = `${author.textContent.trim()}-${time.getAttribute('datetime') || time.textContent}`;
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    const text = element.textContent.substring(0, 100);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

function createPanel() {
    if (document.getElementById('linkedin-organizer-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'linkedin-organizer-panel';
    panel.innerHTML = `
        <div id="organizer-header">
            <div id="organizer-header-content">
                <h3>LinkedIn Saved Posts Organizer</h3>
                <span id="organizer-author">by Jatin</span>
            </div>
            <button id="toggle-panel">−</button>
        </div>
        <div id="organizer-content">
            <button class="organizer-btn go-to-saved-posts-btn" id="go-to-saved-posts">
                📋 Go to Saved Posts
            </button>
            <div class="status-indicator">✔ Extension Active</div>
            <div class="organizer-section">
                <label>🔍 Search Posts</label>
                <input type="text" id="search-input" class="organizer-input" placeholder="Type to search...">
            </div>
            <div class="organizer-section">
                <label>🏷️ Filter by Label</label>
                <div class="label-pills" id="label-filter"><span style="color:#999;font-size:13px;">No labels yet</span></div>
            </div>
            <div class="organizer-section">
                <label>✨ Manage Labels</label>
                <input type="text" id="new-label" class="organizer-input" placeholder="e.g., Career, Tech, AI">
                <button class="organizer-btn" id="create-label">Add Label</button>
            </div>
            <div class="organizer-section">
                <button class="organizer-btn secondary" id="show-pinned">📌 Pinned</button>
                <button class="organizer-btn secondary" id="export-data">💾 Backup Data</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);
    makeDraggable(panel);
    setupPanelListeners();
}

function makeDraggable(element) {
    const header = element.querySelector('#organizer-header');
    let pos1=0,pos2=0,pos3=0,pos4=0;
    header.onmousedown = (e) => {
        e.preventDefault();
        pos3=e.clientX; pos4=e.clientY;
        document.onmouseup = () => { document.onmouseup=null; document.onmousemove=null; };
        document.onmousemove = (e) => {
            e.preventDefault();
            pos1=pos3-e.clientX; pos2=pos4-e.clientY; pos3=e.clientX; pos4=e.clientY;
            element.style.top=(element.offsetTop-pos2)+"px";
            element.style.left=(element.offsetLeft-pos1)+"px";
            element.style.right="auto";
        };
    };
}

function setupPanelListeners() {
    document.getElementById('toggle-panel').onclick = function() {
        const panel = document.getElementById('linkedin-organizer-panel');
        panel.classList.toggle('minimized');
        this.textContent = panel.classList.contains('minimized') ? '+' : '−';
    };
    document.getElementById('go-to-saved-posts').onclick = () => {
        window.location.href = 'https://www.linkedin.com/my-items/saved-posts/';
    };
    const searchInput = document.getElementById('search-input');
    searchInput.oninput = debounce((e) => searchPosts(e.target.value), 300);
    searchInput.onkeydown = (e) => { if(e.key==='Escape') { searchInput.value=''; searchPosts(''); } };
    document.getElementById('show-pinned').onclick = showPinnedOnly;
    document.getElementById('export-data').onclick = exportData;
    document.getElementById('create-label').onclick = async () => {
        const input = document.getElementById('new-label');
        const labelName = input.value.trim();
        if (labelName) {
            const data = await getData();
            if (!data.availableLabels) data.availableLabels = [];
            if (!data.availableLabels.includes(labelName)) {
                data.availableLabels.push(labelName);
                await saveData(data);
                input.value = '';
                await updateLabelFilter();
            }
        }
    };
}

function findPosts() {
    const selectors = ['li.reusable-search__result-container','.reusable-search__result-container','main ul > li'];
    for (const sel of selectors) {
        const posts = Array.from(document.querySelectorAll(sel)).filter(p => p.textContent.trim().length > 50);
        if (posts.length > 0) return posts;
    }
    return [];
}

function showLabelModal(postId, currentLabels = []) {
    const existing = document.getElementById('li-org-label-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'li-org-label-modal';
    
    const availableLabels = currentData.availableLabels || [];
    const labelsHtml = availableLabels.length > 0 ? availableLabels.map(label => {
        const isSelected = currentLabels.includes(label);
        return `<div class="modal-label-item ${isSelected?'selected':''}" data-label="${label}">
            <span class="label-checkbox">${isSelected?'✓':''}</span>
            <span style="font-size:14px;color:rgba(0,0,0,0.9);">${label}</span>
        </div>`;
    }).join('') : '<p style="color:#666;text-align:center;padding:20px;font-size:14px;">No labels available.<br>Create labels in the panel first.</p>';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <h3>Select Labels</h3>
        <div id="modal-labels-container">${labelsHtml}</div>
        <div class="modal-buttons">
            <button id="modal-cancel" class="organizer-btn secondary">Cancel</button>
            <button id="modal-save" class="organizer-btn">Save</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const selectedLabels = new Set(currentLabels);
    modal.querySelectorAll('.modal-label-item').forEach(item => {
        item.onclick = function() {
            const label = this.getAttribute('data-label');
            if (selectedLabels.has(label)) {
                selectedLabels.delete(label);
                this.classList.remove('selected');
                this.querySelector('.label-checkbox').textContent = '';
            } else {
                selectedLabels.add(label);
                this.classList.add('selected');
                this.querySelector('.label-checkbox').textContent = '✓';
            }
        };
    });
    
    modalContent.querySelector('#modal-save').onclick = async () => {
        const data = await getData();
        if (selectedLabels.size > 0) data.labels[postId] = Array.from(selectedLabels);
        else delete data.labels[postId];
        await saveData(data);
        modal.remove();
        const posts = findPosts();
        const post = posts.find(p => getPostId(p) === postId);
        if (post) updatePostDisplay(post, postId);
        await updateLabelFilter();
    };
    
    modalContent.querySelector('#modal-cancel').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function updatePostDisplay(postElement, postId) {
    const oldLabels = postElement.querySelector('.li-org-post-labels');
    const oldNote = postElement.querySelector('.li-org-post-note');
    if (oldLabels) oldLabels.remove();
    if (oldNote) oldNote.remove();
    
    const data = currentData;
    const labels = data.labels[postId] || [];
    const note = data.notes[postId] || '';
    const isPinned = data.pins.includes(postId);
    
    const pinBtn = postElement.querySelector('.pin-btn');
    if (pinBtn) {
        pinBtn.classList.toggle('pinned', isPinned);
        pinBtn.title = isPinned ? 'Unpin' : 'Pin';
    }
    
    if (labels.length > 0) {
        const labelsDiv = document.createElement('div');
        labelsDiv.className = 'li-org-post-labels';
        labels.forEach(label => {
            const tag = document.createElement('span');
            tag.className = 'li-org-label-tag';
            tag.textContent = label;
            labelsDiv.appendChild(tag);
        });
        postElement.appendChild(labelsDiv);
    }
    
    if (note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'li-org-post-note';
        noteDiv.textContent = note;
        postElement.appendChild(noteDiv);
    }
}

async function addPostControls(postElement) {
    const postId = getPostId(postElement);
    if (!postId || postElement.querySelector('.li-org-post-controls')) return;
    
    const data = currentData;
    const isPinned = data.pins.includes(postId);
    const labels = data.labels[postId] || [];
    const note = data.notes[postId] || '';
    
    const controls = document.createElement('div');
    controls.className = 'li-org-post-controls';
    controls.innerHTML = `
        <button class="li-org-control-btn pin-btn ${isPinned?'pinned':''}" title="${isPinned?'Unpin':'Pin'}">📌</button>
        <button class="li-org-control-btn label-btn" title="Add labels">🏷️</button>
        <button class="li-org-control-btn note-btn" title="Add note">📝</button>
    `;
    
    if (getComputedStyle(postElement).position === 'static') postElement.style.position = 'relative';
    postElement.insertBefore(controls, postElement.firstChild);
    
    if (labels.length > 0) {
        const labelsDiv = document.createElement('div');
        labelsDiv.className = 'li-org-post-labels';
        labels.forEach(label => {
            const tag = document.createElement('span');
            tag.className = 'li-org-label-tag';
            tag.textContent = label;
            labelsDiv.appendChild(tag);
        });
        postElement.appendChild(labelsDiv);
    }
    
    if (note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'li-org-post-note';
        noteDiv.textContent = note;
        postElement.appendChild(noteDiv);
    }
    
    controls.querySelector('.pin-btn').onclick = async (e) => { 
        e.stopPropagation(); 
        e.preventDefault(); 
        await togglePin(postId, postElement); 
    };
    controls.querySelector('.label-btn').onclick = (e) => { 
        e.stopPropagation(); 
        e.preventDefault(); 
        showLabelModal(postId, currentData.labels[postId] || []); 
    };
    controls.querySelector('.note-btn').onclick = async (e) => { 
        e.stopPropagation(); 
        e.preventDefault(); 
        await showNoteDialog(postId, postElement); 
    };
}

async function togglePin(postId, postElement) {
    const data = await getData();
    const index = data.pins.indexOf(postId);
    if (index > -1) data.pins.splice(index, 1);
    else data.pins.unshift(postId);
    await saveData(data);
    updatePostDisplay(postElement, postId);
}

async function showNoteDialog(postId, postElement) {
    const data = await getData();
    const currentNote = data.notes[postId] || '';
    const result = prompt('Add a note for this post:', currentNote);
    if (result !== null) {
        if (result.trim()) data.notes[postId] = result.trim();
        else delete data.notes[postId];
        await saveData(data);
        updatePostDisplay(postElement, postId);
    }
}

async function updateLabelFilter() {
    const data = await getData();
    const availableLabels = data.availableLabels || [];
    const filterDiv = document.getElementById('label-filter');
    if (!filterDiv) return;
    
    filterDiv.innerHTML = '';
    if (availableLabels.length === 0) {
        filterDiv.innerHTML = '<span style="color:#999;font-size:13px;">No labels - create some below!</span>';
        return;
    }
    
    const labelCounts = {};
    availableLabels.forEach(label => labelCounts[label] = 0);
    Object.values(data.labels).forEach(postLabels => {
        postLabels.forEach(label => { 
            if (labelCounts.hasOwnProperty(label)) labelCounts[label]++; 
        });
    });
    
    availableLabels.forEach(label => {
        const count = labelCounts[label];
        const pill = document.createElement('div');
        pill.className = 'label-pill' + (activeFilter === label ? ' active-filter' : '');
        pill.innerHTML = `${label} (${count}) <span class="remove">×</span>`;
        pill.onclick = (e) => {
            if (e.target.classList.contains('remove')) removeLabel(label);
            else toggleFilter(label);
        };
        filterDiv.appendChild(pill);
    });
}

function toggleFilter(label) {
    if (activeFilter === label) {
        activeFilter = null;
        showAll();
    } else {
        activeFilter = label;
        filterByLabel(label);
    }
    updateLabelFilter();
}

function filterByLabel(label) {
    const data = currentData;
    findPosts().forEach(post => {
        const postId = getPostId(post);
        const postLabels = data.labels[postId] || [];
        post.style.display = postLabels.includes(label) ? '' : 'none';
    });
}

async function removeLabel(label) {
    if (!confirm(`Delete "${label}"?\n\nThis removes it from all posts.`)) return;
    const data = await getData();
    data.availableLabels = data.availableLabels.filter(l => l !== label);
    Object.keys(data.labels).forEach(postId => {
        data.labels[postId] = data.labels[postId].filter(l => l !== label);
        if (data.labels[postId].length === 0) delete data.labels[postId];
    });
    await saveData(data);
    if (activeFilter === label) { activeFilter = null; showAll(); }
    findPosts().forEach(post => updatePostDisplay(post, getPostId(post)));
    updateLabelFilter();
}

function showAll() {
    activeFilter = null;
    findPosts().forEach(post => post.style.display = '');
    updateLabelFilter();
}

async function showPinnedOnly() {
    activeFilter = 'pinned';
    const data = await getData();
    findPosts().forEach(post => {
        const postId = getPostId(post);
        post.style.display = data.pins.includes(postId) ? '' : 'none';
    });
}

function searchPosts(query) {
    const posts = findPosts();
    if (!query.trim()) {
        if (activeFilter === 'pinned') showPinnedOnly();
        else if (activeFilter) filterByLabel(activeFilter);
        else showAll();
        return;
    }
    const lowerQuery = query.toLowerCase();
    posts.forEach(post => {
        post.style.display = post.textContent.toLowerCase().includes(lowerQuery) ? '' : 'none';
    });
}

async function exportData() {
    const data = await getData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin-posts-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function isOnSavedPostsPage() {
    return window.location.href.includes('/my-items/saved-posts');
}

async function init() {
    if (!isOnSavedPostsPage() || isInitialized) return;

    console.log('🚀 LinkedIn Organizer: Initializing...');
    isInitialized = true;
    await getData();
    injectStyles();
    createPanel();

    let attempts = 0;
    const maxAttempts = 30; // Increased from 15 to 30 (15 seconds total)
    const checkInterval = setInterval(async () => {
        attempts++;
        const posts = findPosts();

        if (posts.length > 0) {
            console.log(`✅ LinkedIn Organizer: Found ${posts.length} posts after ${attempts} attempts`);
            clearInterval(checkInterval);

            for (const post of posts) await addPostControls(post);
            await updateLabelFilter();

            const observer = new MutationObserver(debounce(async () => {
                const newPosts = findPosts();
                const searchInput = document.getElementById('search-input');
                for (const post of newPosts) {
                    if (!post.querySelector('.li-org-post-controls')) await addPostControls(post);
                }
                if (searchInput && searchInput.value.trim()) searchPosts(searchInput.value);
                else if (activeFilter === 'pinned') showPinnedOnly();
                else if (activeFilter) filterByLabel(activeFilter);
            }, 300));

            const main = document.querySelector('main') || document.body;
            observer.observe(main, { childList: true, subtree: true });
        } else if (attempts >= maxAttempts) {
            console.warn(`⚠️ LinkedIn Organizer: No posts found after ${maxAttempts} attempts`);
            clearInterval(checkInterval);
        } else if (attempts % 5 === 0) {
            console.log(`⏳ LinkedIn Organizer: Still waiting for posts... (attempt ${attempts}/${maxAttempts})`);
        }
    }, 500);
}

let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        const wasOnSavedPosts = lastUrl.includes('/my-items/saved-posts');
        const nowOnSavedPosts = url.includes('/my-items/saved-posts');

        lastUrl = url;
        console.log('🔄 LinkedIn Organizer: URL changed to:', url);

        // Reset if leaving saved posts page
        if (wasOnSavedPosts && !nowOnSavedPosts) {
            console.log('👋 LinkedIn Organizer: Left saved posts page, cleaning up');
            isInitialized = false;
        }

        // Initialize if entering saved posts page
        if (!wasOnSavedPosts && nowOnSavedPosts) {
            console.log('👋 LinkedIn Organizer: Entered saved posts page');
            isInitialized = false; // Reset flag to allow initialization
            setTimeout(init, 1000); // Give LinkedIn SPA time to render
        }
    }
});

function startUrlObserver() {
    if (document.body) {
        urlObserver.observe(document.body, {subtree: true, childList: true});
        console.log('🔍 LinkedIn Organizer: URL observer started');
    } else {
        setTimeout(startUrlObserver, 100);
    }
}

// Enhanced initialization with multiple strategies
function initializeExtension() {
    console.log('📍 LinkedIn Organizer: Current URL:', location.href);
    console.log('📍 LinkedIn Organizer: readyState:', document.readyState);

    startUrlObserver();

    if (isOnSavedPostsPage()) {
        // Try immediate initialization
        init();

        // Also try with delays to catch late-loading content
        setTimeout(() => {
            if (!isInitialized) {
                console.log('⏰ LinkedIn Organizer: Retrying initialization after 1s delay');
                init();
            }
        }, 1000);

        setTimeout(() => {
            if (!isInitialized) {
                console.log('⏰ LinkedIn Organizer: Retrying initialization after 2s delay');
                init();
            }
        }, 2000);
    }
}

// Start based on document ready state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    // Document already loaded, initialize immediately
    initializeExtension();
}