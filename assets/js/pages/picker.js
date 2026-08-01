import { storage } from '../services/StorageService.js';
import { omdb } from '../services/OmdbService.js';

export class PickerController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div style="text-align: center; max-width: 600px; margin: 0 auto; padding-top: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Random Picker</h1>
                <p class="text-secondary animate-slide-up delay-100" style="margin-bottom: var(--spacing-lg);">Can't decide what to watch? Let the vault choose.</p>
                
                <div class="controls animate-slide-up delay-100" style="display: flex; justify-content: center; margin-bottom: var(--spacing-xl);">
                    <select id="picker-type" class="input-field" style="width: 200px; padding: 0.5rem 1rem;">
                        <option value="all">All Content</option>
                        <option value="movies">Movies</option>
                        <option value="series">Web Series</option>
                    </select>
                </div>

                <div class="glass-panel animate-scale-up delay-200" style="padding: var(--spacing-2xl); position: relative; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    
                    <div id="picker-result" style="width: 100%; display: none;">
                        <!-- Selected item will appear here -->
                    </div>
                    
                    <div id="picker-idle">
                        <i class="ph ph-dice-five" style="font-size: 6rem; color: var(--text-secondary); margin-bottom: 1.5rem;"></i>
                        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Pick a random item from your Watchlist.</p>
                        <button class="btn btn-primary btn-large" id="btn-spin" style="font-size: 1.2rem; padding: 1rem 2rem;">
                            <i class="ph ph-magic-wand"></i> Pick a Title
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const btnSpin = this.container.querySelector('#btn-spin');
        if (btnSpin) {
            btnSpin.addEventListener('click', () => this.spin());
        }
    }

    spin() {
        const typeFilter = this.container.querySelector('#picker-type').value;
        const allMovies = storage.getMovies() || [];
        const allSeries = storage.getSeries() || [];

        // Add a _type flag so we know how to render and link
        const wantMovies = allMovies.filter(m => m.status === 'want').map(m => ({...m, _type: 'movie'}));
        const wantSeries = allSeries.filter(s => s.status === 'want').map(s => ({...s, _type: 'series'}));

        let items = [];

        if (typeFilter === 'movies') {
            items = wantMovies;
        } else if (typeFilter === 'series') {
            items = wantSeries;
        } else {
            // all
            items = [...wantMovies, ...wantSeries];
        }

        // Graceful fallback if selection is empty but other items exist
        if (items.length === 0) {
            if (typeFilter === 'all') {
                alert("Your watchlists are empty! Add some movies or web series first.");
            } else if (typeFilter === 'movies') {
                if (wantSeries.length > 0) {
                    alert("Your movie watchlist is empty! Showing a Web Series instead.");
                    items = wantSeries;
                    this.container.querySelector('#picker-type').value = 'series';
                } else {
                    alert("Your movie watchlist is empty! Add some movies first.");
                }
            } else if (typeFilter === 'series') {
                if (wantMovies.length > 0) {
                    alert("Your series watchlist is empty! Showing a Movie instead.");
                    items = wantMovies;
                    this.container.querySelector('#picker-type').value = 'movies';
                } else {
                    alert("Your series watchlist is empty! Add some web series first.");
                }
            }
            if (items.length === 0) return;
        }

        const idle = this.container.querySelector('#picker-idle');
        const result = this.container.querySelector('#picker-result');
        
        idle.style.display = 'none';
        result.style.display = 'block';
        
        // Simple shuffle animation
        let count = 0;
        const maxSpins = 20;
        const interval = setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const posterUrl = omdb.getImageUrl(randomItem.poster_path);
            
            result.innerHTML = `
                <img src="${posterUrl}" style="width: 150px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); margin: 0 auto 1rem auto; opacity: 0.5;">
                <h3>${randomItem.title}</h3>
            `;
            
            count++;
            if (count > maxSpins) {
                clearInterval(interval);
                // Final selection
                const finalItem = items[Math.floor(Math.random() * items.length)];
                const finalPoster = omdb.getImageUrl(finalItem.poster_path);
                const isMovie = finalItem._type === 'movie';
                const detailLink = isMovie ? `#movie-detail/${finalItem.id}` : `#series-detail/${finalItem.id}`;
                const badgeHtml = isMovie 
                    ? `<span class="badge" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; margin-bottom: 0.5rem; display: inline-block;">🎬 Movie</span>`
                    : `<span class="badge" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; margin-bottom: 0.5rem; display: inline-block;">📺 Web Series</span>`;

                result.innerHTML = `
                    <div class="animate-scale-up" style="animation-duration: 0.5s;">
                        ${badgeHtml}
                        <img src="${finalPoster}" style="width: 200px; border-radius: var(--radius-md); box-shadow: var(--shadow-glow); margin: 0 auto 1rem auto; display: block;">
                        <h2 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 2rem;">${finalItem.title}</h2>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                            <a href="${detailLink}" class="btn btn-primary">View Details</a>
                            <button class="btn btn-secondary" onclick="window.cinevault.controllers.picker.spin()">Spin Again</button>
                        </div>
                    </div>
                `;
            }
        }, 100);
    }
}
