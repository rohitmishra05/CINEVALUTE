import { storage } from '../services/StorageService.js';
import { omdb } from '../services/OmdbService.js';

export class HomeController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const data = storage.getData();
        const movies = data.movies || [];
        
        // Calculate basic stats
        const totalMovies = movies.length;
        const watched = movies.filter(m => m.status === 'watched' || m.status === 'rewatched').length;
        const watchLater = movies.filter(m => m.status === 'want').length;
        
        let avgRating = 0;
        const ratedMovies = movies.filter(m => m.personalRating > 0);
        if (ratedMovies.length > 0) {
            avgRating = (ratedMovies.reduce((acc, m) => acc + m.personalRating, 0) / ratedMovies.length).toFixed(1);
        }

        const recentMovies = movies.slice(0, 5); // top 5 recently added

        this.container.innerHTML = `
            <div class="dashboard-header" style="margin-bottom: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Dashboard</h1>
                <p class="text-secondary animate-slide-up delay-100">Welcome back to your cinema universe.</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid animate-slide-up delay-200">
                
                <div class="glass-panel" style="padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--accent-gold);">
                        <i class="ph ph-film-strip" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; font-family: var(--font-display);">${totalMovies}</div>
                        <div class="text-secondary" style="font-size: 0.9rem;">Total Movies</div>
                    </div>
                </div>

                <div class="glass-panel" style="padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--status-watched);">
                        <i class="ph ph-eye" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; font-family: var(--font-display);">${watched}</div>
                        <div class="text-secondary" style="font-size: 0.9rem;">Watched</div>
                    </div>
                </div>

                <div class="glass-panel" style="padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--status-want);">
                        <i class="ph ph-clock" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; font-family: var(--font-display);">${watchLater}</div>
                        <div class="text-secondary" style="font-size: 0.9rem;">Watch Later</div>
                    </div>
                </div>

                <div class="glass-panel" style="padding: var(--spacing-lg); display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--accent-gold);">
                        <i class="ph ph-star" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 2rem; font-weight: 700; font-family: var(--font-display);">${avgRating}</div>
                        <div class="text-secondary" style="font-size: 0.9rem;">Avg Rating</div>
                    </div>
                </div>
            </div>

            <!-- Recently Added -->
            <div class="section-recent animate-slide-up delay-300">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h2>Recently Added</h2>
                    <a href="#movies" class="text-gold" style="font-size: 0.9rem; font-weight: 500;">View All <i class="ph ph-arrow-right"></i></a>
                </div>
                
                ${recentMovies.length === 0 ? `
                    <div class="glass-panel" style="padding: var(--spacing-xl); text-align: center; color: var(--text-secondary);">
                        <i class="ph ph-empty" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Your vault is empty. Start discovering movies!</p>
                        <a href="#search" class="btn btn-primary" style="margin-top: 1rem;">Discover Movies</a>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-lg);">
                        ${this.generateMovieCards(recentMovies)}
                    </div>
                `}
            </div>
        `;

        this.attachEventListeners();
    }

    generateMovieCards(movies) {
        return movies.map((movie, index) => {
            const posterUrl = omdb.getImageUrl(movie.poster_path);
            const delay = (index % 5) * 100;
            return `
                <div class="movie-card animate-scale-up" style="animation-delay: ${delay}ms" data-id="${movie.id}">
                    <img src="${posterUrl}" alt="${movie.title}" loading="lazy">
                    <div class="movie-card-overlay">
                        <h3 class="movie-title-sm">${movie.title}</h3>
                    </div>
                </div>
            `;
        }).join('');
    }

    attachEventListeners() {
        // Navigate to details on click
        const cards = this.container.querySelectorAll('.movie-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                window.location.hash = `#movie-detail/${id}`;
            });
        });
    }
}
