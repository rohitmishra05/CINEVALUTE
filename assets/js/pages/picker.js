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
                <h1 class="animate-slide-up">Random Movie Picker</h1>
                <p class="text-secondary animate-slide-up delay-100" style="margin-bottom: var(--spacing-xl);">Can't decide what to watch? Let the vault choose.</p>
                
                <div class="glass-panel animate-scale-up delay-200" style="padding: var(--spacing-2xl); position: relative; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    
                    <div id="picker-result" style="width: 100%; display: none;">
                        <!-- Selected movie will appear here -->
                    </div>
                    
                    <div id="picker-idle">
                        <i class="ph ph-dice-five" style="font-size: 6rem; color: var(--text-secondary); margin-bottom: 1.5rem;"></i>
                        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Pick a random movie from your Watchlist.</p>
                        <button class="btn btn-primary btn-large" id="btn-spin" style="font-size: 1.2rem; padding: 1rem 2rem;">
                            <i class="ph ph-magic-wand"></i> Pick a Movie
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
        const movies = storage.getMovies().filter(m => m.status === 'want');
        
        if (movies.length === 0) {
            alert("Your watchlist is empty! Add some movies first.");
            return;
        }

        const idle = this.container.querySelector('#picker-idle');
        const result = this.container.querySelector('#picker-result');
        
        idle.style.display = 'none';
        result.style.display = 'block';
        
        // Simple shuffle animation
        let count = 0;
        const maxSpins = 20;
        const interval = setInterval(() => {
            const randomMovie = movies[Math.floor(Math.random() * movies.length)];
            const posterUrl = omdb.getImageUrl(randomMovie.poster_path);
            
            result.innerHTML = `
                <img src="${posterUrl}" style="width: 150px; border-radius: var(--radius-md); box-shadow: var(--shadow-soft); margin: 0 auto 1rem auto; opacity: 0.5;">
                <h3>${randomMovie.title}</h3>
            `;
            
            count++;
            if (count > maxSpins) {
                clearInterval(interval);
                // Final selection
                const finalMovie = movies[Math.floor(Math.random() * movies.length)];
                const finalPoster = omdb.getImageUrl(finalMovie.poster_path);
                
                result.innerHTML = `
                    <div class="animate-scale-up" style="animation-duration: 0.5s;">
                        <img src="${finalPoster}" style="width: 200px; border-radius: var(--radius-md); box-shadow: var(--shadow-glow); margin: 0 auto 1rem auto;">
                        <h2 style="color: var(--accent-gold); margin-bottom: 0.5rem; font-size: 2rem;">${finalMovie.title}</h2>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                            <a href="#movie-detail/${finalMovie.id}" class="btn btn-primary">View Details</a>
                            <button class="btn btn-secondary" onclick="window.cinevault.controllers.picker.spin()">Spin Again</button>
                        </div>
                    </div>
                `;
            }
        }, 100);
    }
}
