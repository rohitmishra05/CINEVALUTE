import { storage } from '../services/StorageService.js';
import { omdb } from '../services/OmdbService.js';

export class SeriesController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.series = storage.getSeries() || [];
        this.filter = 'all'; // all, want, watching, watched, rewatched
        this.sort = 'added_desc'; // added_desc, added_asc, rating_desc, title_asc
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="movies-header" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-2xl);">
                <div>
                    <h1 class="animate-slide-up">My Web Series</h1>
                    <p class="text-secondary animate-slide-up delay-100">Your television journey.</p>
                </div>
                
                <div class="controls animate-slide-up delay-200" style="display: flex; gap: var(--spacing-md);">
                    <select id="series-filter" class="input-field" style="width: 150px; padding: 0.5rem 1rem;">
                        <option value="all">All Series</option>
                        <option value="want">Want to Watch</option>
                        <option value="watching">Watching</option>
                        <option value="watched">Watched</option>
                        <option value="rewatched">Rewatched</option>
                    </select>

                    <select id="series-sort" class="input-field" style="width: 150px; padding: 0.5rem 1rem;">
                        <option value="added_desc">Recently Added</option>
                        <option value="added_asc">Oldest Added</option>
                        <option value="rating_desc">Highest Rated</option>
                        <option value="title_asc">Title (A-Z)</option>
                    </select>
                </div>
            </div>

            <div id="series-grid" class="movie-grid">
                <!-- Series will be rendered here -->
            </div>
        `;

        this.renderGrid();
        this.attachEventListeners();
    }

    getFilteredAndSortedSeries() {
        // Filter
        let result = this.series;
        if (this.filter !== 'all') {
            result = result.filter(s => s.status === this.filter);
        }

        // Sort
        result.sort((a, b) => {
            switch (this.sort) {
                case 'added_desc':
                    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
                case 'added_asc':
                    return new Date(a.addedAt || 0) - new Date(b.addedAt || 0);
                case 'rating_desc':
                    return (b.personalRating || 0) - (a.personalRating || 0);
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return result;
    }

    renderGrid() {
        const grid = this.container.querySelector('#series-grid');
        const displaySeries = this.getFilteredAndSortedSeries();

        if (displaySeries.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-2xl);">
                    <i class="ph ph-television" style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                    <p>No web series found in this category.</p>
                </div>
            `;
            return;
        }

        const statusColors = {
            'want': 'var(--status-want)',
            'watching': 'var(--status-watching)',
            'watched': 'var(--status-watched)',
            'rewatched': 'var(--status-rewatched)'
        };

        grid.innerHTML = displaySeries.map((series, index) => {
            const posterUrl = omdb.getImageUrl(series.poster_path);
            const delay = (index % 10) * 50;
            const statusColor = statusColors[series.status] || 'var(--text-secondary)';
            
            return `
                <div class="movie-card animate-scale-up" style="animation-delay: ${delay}ms" data-id="${series.id}">
                    <img src="${posterUrl}" alt="${series.title}" loading="lazy">
                    <div class="movie-card-overlay">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <h3 class="movie-title-sm" style="flex: 1; white-space: normal; line-height: 1.2;">${series.title}</h3>
                            ${series.personalRating > 0 ? `<span style="color: var(--accent-gold); font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">⭐ ${series.personalRating}</span>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor};"></div>
                            <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: capitalize;">${series.status}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach click events
        grid.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                window.location.hash = `#series-detail/${card.dataset.id}`;
            });
        });
    }

    attachEventListeners() {
        const filterEl = this.container.querySelector('#series-filter');
        const sortEl = this.container.querySelector('#series-sort');

        filterEl.addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderGrid();
        });

        sortEl.addEventListener('change', (e) => {
            this.sort = e.target.value;
            this.renderGrid();
        });
    }
}
