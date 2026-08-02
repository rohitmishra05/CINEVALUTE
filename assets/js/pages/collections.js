import { storage } from '../services/StorageService.js';
import { omdb } from '../services/OmdbService.js';

export class CollectionsController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const collections = storage.getCollections();
        const movies = storage.getMovies();
        const series = storage.getSeries();
        const selectedId = storage.getSelectedCollectionId();

        // Count items per collection
        const collectionCounts = {};
        movies.forEach(m => {
            if (m.collections) {
                m.collections.forEach(c => {
                    collectionCounts[c] = (collectionCounts[c] || 0) + 1;
                });
            }
        });
        series.forEach(s => {
            if (s.collections) {
                s.collections.forEach(c => {
                    collectionCounts[c] = (collectionCounts[c] || 0) + 1;
                });
            }
        });

        const activeCol = collections.find(c => c.id === selectedId) || collections[0];
        const activeColId = activeCol ? activeCol.id : selectedId;

        const activeMovies = movies.filter(m => m.collections && m.collections.includes(activeColId));
        const activeSeries = series.filter(s => s.collections && s.collections.includes(activeColId));

        this.container.innerHTML = `
            <div class="collections-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-2xl);">
                <div>
                    <h1 class="animate-slide-up">Collections</h1>
                    <p class="text-secondary animate-slide-up delay-100">Organize your films and web series into custom lists.</p>
                </div>
                <button class="btn btn-primary animate-slide-up delay-200" id="btn-new-collection">
                    <i class="ph ph-plus"></i> New Collection
                </button>
            </div>

            <div id="collections-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl);">
                ${collections.map((col, index) => {
                    const count = collectionCounts[col.id] || 0;
                    const isSelected = col.id === activeColId;
                    const isBuiltIn = col.id === 'watchlist' || col.id === 'fav';
                    const delay = (index % 10) * 80;

                    return `
                        <div class="glass-panel animate-scale-up collection-card" 
                             data-id="${col.id}" 
                             style="padding: var(--spacing-lg); animation-delay: ${delay}ms; cursor: pointer; border: ${isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)'}; box-shadow: ${isSelected ? 'var(--shadow-glow)' : 'var(--shadow-glass)'};">
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
                                <h3 style="font-family: var(--font-display); font-size: 1.25rem; color: ${isSelected ? 'var(--accent-gold)' : 'var(--text-primary)'};">${col.name}</h3>
                                <span class="badge ${isSelected ? 'badge-gold' : ''}">${count} Items</span>
                            </div>

                            <p class="text-secondary" style="font-size: 0.9rem; line-height: 1.4; margin-bottom: var(--spacing-sm);">${col.description || 'Custom collection.'}</p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: var(--spacing-xs);">
                                <span style="font-size: 0.8rem; font-weight: 600; color: ${isSelected ? 'var(--accent-gold)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.35rem;">
                                    ${isSelected ? '<i class="ph ph-check-circle-fill text-gold"></i> Active' : 'Click to View'}
                                </span>
                                ${!isBuiltIn ? `
                                    <button class="btn-icon btn-delete-col" data-id="${col.id}" data-name="${col.name}" title="Delete Collection" style="width: 28px; height: 28px; font-size: 0.8rem; color: #fa5252;" onclick="event.stopPropagation()">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Items in Currently Selected Collection -->
            <div class="active-collection-contents animate-slide-up delay-200">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
                    <h2>
                        <i class="ph ph-folder-open text-gold"></i> 
                        ${activeCol ? activeCol.name : 'Collection'} 
                        <span class="text-secondary" style="font-weight: 300; font-size: 1rem;">(${activeMovies.length} movies, ${activeSeries.length} series)</span>
                    </h2>
                </div>

                ${(activeMovies.length === 0 && activeSeries.length === 0) ? `
                    <div class="glass-panel" style="padding: var(--spacing-2xl); text-align: center; color: var(--text-secondary);">
                        <i class="ph ph-film-strip" style="font-size: 3.5rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i>
                        <p>No movies or web series added to this collection yet.</p>
                        <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-muted);">
                            Open any movie or web series details and check <strong>${activeCol ? activeCol.name : 'this collection'}</strong> under "Add to Collection"!
                        </p>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-xl);">
                        ${activeMovies.map((movie, index) => this.generateItemCard(movie, 'movie', index)).join('')}
                        ${activeSeries.map((s, index) => this.generateItemCard(s, 'series', index + activeMovies.length)).join('')}
                    </div>
                `}
            </div>
        `;

        this.attachEventListeners();
    }

    generateItemCard(item, type, index) {
        const posterUrl = omdb.getImageUrl(item.poster_path);
        const delay = (index % 10) * 50;
        const isMovie = type === 'movie';
        const route = isMovie ? `#movie-detail/${item.id}` : `#series-detail/${item.id}`;
        const badgeLabel = isMovie ? '🎬 Movie' : '📺 Series';

        return `
            <div class="movie-card animate-scale-up" style="animation-delay: ${delay}ms" data-route="${route}">
                <span style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.8); color: white; padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); z-index: 4;">
                    ${badgeLabel}
                </span>
                <img src="${posterUrl}" alt="${item.title}" loading="lazy">
                <div class="movie-card-overlay">
                    <h3 class="movie-title-sm">${item.title}</h3>
                    ${item.personalRating ? `<div style="color: var(--accent-gold); font-size: 0.8rem; font-weight: bold; margin-top: 0.25rem;">⭐ ${item.personalRating}/10</div>` : ''}
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Create new collection
        const btnNew = this.container.querySelector('#btn-new-collection');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                const name = prompt("Enter new collection name (e.g. ❤️ Emotional, 🎬 Nolan):");
                if (name && name.trim()) {
                    const desc = prompt("Enter description (optional):");
                    storage.addCollection(name.trim(), desc ? desc.trim() : 'Custom collection.');
                    this.render();
                }
            });
        }

        // Select collection card
        const colCards = this.container.querySelectorAll('.collection-card');
        colCards.forEach(card => {
            card.addEventListener('click', () => {
                const colId = card.dataset.id;
                storage.setSelectedCollectionId(colId);
                this.render();
            });
        });

        // Delete collection
        const deleteBtns = this.container.querySelectorAll('.btn-delete-col');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const name = btn.dataset.name;

                if (confirm(`Delete collection "${name}"?\n(Items in this collection will NOT be deleted from your vault)`)) {
                    storage.deleteCollection(id);
                    this.render();
                }
            });
        });

        // Item card navigation
        const itemCards = this.container.querySelectorAll('.movie-card');
        itemCards.forEach(card => {
            card.addEventListener('click', () => {
                if (card.dataset.route) {
                    window.location.hash = card.dataset.route;
                }
            });
        });
    }
}
