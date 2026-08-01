import { storage } from '../services/StorageService.js';

export class CollectionsController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const data = storage.getData();
        const collections = data.collections || [];
        const movies = data.movies || [];

        // Count movies per collection
        const collectionCounts = {};
        movies.forEach(m => {
            if (m.collections) {
                m.collections.forEach(c => {
                    collectionCounts[c] = (collectionCounts[c] || 0) + 1;
                });
            }
        });

        this.container.innerHTML = `
            <div class="collections-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-2xl);">
                <div>
                    <h1 class="animate-slide-up">Collections</h1>
                    <p class="text-secondary animate-slide-up delay-100">Organize your films your way.</p>
                </div>
                <button class="btn btn-primary animate-slide-up delay-200" id="btn-new-collection">
                    <i class="ph ph-plus"></i> New Collection
                </button>
            </div>

            <div id="collections-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg);">
                ${collections.map((col, index) => {
                    const count = collectionCounts[col.id] || 0;
                    const delay = (index % 10) * 100;
                    return `
                        <div class="glass-panel animate-scale-up" style="padding: var(--spacing-lg); animation-delay: ${delay}ms; cursor: pointer; transition: transform var(--transition-fast);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
                            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-sm);">
                                <h3 style="font-family: var(--font-display); font-size: 1.25rem;">${col.name}</h3>
                                <span class="badge badge-gold">${count} Movies</span>
                            </div>
                            <p class="text-secondary" style="font-size: 0.9rem; line-height: 1.4;">${col.description || 'No description provided.'}</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const btnNew = this.container.querySelector('#btn-new-collection');
        btnNew.addEventListener('click', () => {
            // Simple prompt for now, could be a full modal
            const name = prompt("Enter collection name:");
            if (name) {
                const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const data = storage.getData();
                data.collections.push({
                    id: id,
                    name: name,
                    description: 'Custom collection.'
                });
                storage.saveData(data);
                this.render(); // Re-render
            }
        });
    }
}
