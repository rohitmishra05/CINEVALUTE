import { storage } from '../services/StorageService.js';

export class CollectionModal {
    static open({ title = "Select Collection", initialSelectedIds = [], onSave, onCancel }) {
        // Remove existing modal if any
        const existing = document.getElementById('collection-picker-modal');
        if (existing) existing.remove();

        const collections = storage.getCollections() || [];
        const modalEl = document.createElement('div');
        modalEl.id = 'collection-picker-modal';
        modalEl.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        const renderCollectionsList = (cols, selectedIds) => {
            if (!cols || cols.length === 0) {
                return `
                    <div style="text-align: center; color: var(--text-secondary); padding: 1.5rem 0;">
                        <i class="ph ph-folders" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 0.5rem; display: block;"></i>
                        <p style="margin-bottom: 0.5rem; font-size: 0.95rem;">No collections found.</p>
                    </div>
                `;
            }
            return cols.map(c => {
                const checked = selectedIds.includes(c.id);
                return `
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s ease;">
                        <input type="checkbox" class="modal-col-checkbox" data-col-id="${c.id}" ${checked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-gold); cursor: pointer;">
                        <span style="font-weight: 500; color: var(--text-primary); font-size: 0.95rem;">${c.name}</span>
                    </label>
                `;
            }).join('');
        };

        modalEl.innerHTML = `
            <div class="glass-panel" style="width: 100%; max-width: 400px; padding: 1.5rem; border-radius: var(--radius-lg); background: rgba(18, 19, 26, 0.96); border: 1px solid var(--border-color); box-shadow: var(--shadow-glow); transform: translateY(15px); transition: transform 0.2s ease; box-sizing: border-box;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
                    <h3 style="font-size: 1.2rem; font-family: var(--font-display); color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-folders text-gold"></i> ${title}
                    </h3>
                    <button id="modal-close-btn" class="btn-icon" style="width: 30px; height: 30px;" title="Close">
                        <i class="ph ph-x"></i>
                    </button>
                </div>

                <div id="modal-cols-container" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; padding-right: 0.25rem;">
                    ${renderCollectionsList(collections, initialSelectedIds)}
                </div>

                <button id="modal-add-new-btn" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.6rem;">
                    <i class="ph ph-plus text-gold"></i> Create New Collection
                </button>

                <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button id="modal-cancel-btn" class="btn btn-secondary" style="flex: 1;">Cancel</button>
                    <button id="modal-save-btn" class="btn btn-primary" style="flex: 1;">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);

        // Animate in
        requestAnimationFrame(() => {
            modalEl.style.opacity = '1';
            const content = modalEl.querySelector('.glass-panel');
            if (content) content.style.transform = 'translateY(0)';
        });

        let currentSelectedIds = [...initialSelectedIds];

        const closeModal = () => {
            modalEl.style.opacity = '0';
            const content = modalEl.querySelector('.glass-panel');
            if (content) content.style.transform = 'translateY(15px)';
            setTimeout(() => {
                if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
            }, 200);
        };

        // Attach modal events
        modalEl.querySelector('#modal-close-btn').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        modalEl.querySelector('#modal-cancel-btn').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                closeModal();
                if (onCancel) onCancel();
            }
        });

        // Add new collection button
        modalEl.querySelector('#modal-add-new-btn').addEventListener('click', () => {
            const name = prompt("Enter new collection name (e.g. ❤️ Emotional, 🎬 Nolan):");
            if (name && name.trim()) {
                const desc = prompt("Enter description (optional):");
                const newCol = storage.addCollection(name.trim(), desc ? desc.trim() : 'Custom collection.');
                if (newCol) {
                    currentSelectedIds.push(newCol.id);
                    const updatedCols = storage.getCollections();
                    const container = modalEl.querySelector('#modal-cols-container');
                    container.innerHTML = renderCollectionsList(updatedCols, currentSelectedIds);
                }
            }
        });

        // Checkbox changes
        modalEl.addEventListener('change', (e) => {
            if (e.target && e.target.classList.contains('modal-col-checkbox')) {
                const colId = e.target.dataset.colId;
                if (e.target.checked) {
                    if (!currentSelectedIds.includes(colId)) currentSelectedIds.push(colId);
                } else {
                    currentSelectedIds = currentSelectedIds.filter(id => id !== colId);
                }
            }
        });

        // Save button
        modalEl.querySelector('#modal-save-btn').addEventListener('click', () => {
            closeModal();
            if (onSave) onSave(currentSelectedIds);
        });
    }
}
