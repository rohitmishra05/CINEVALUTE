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
        const series = data.series || [];
        
        // Calculate basic stats for movies (keeping original logic for stats)
        const totalMovies = movies.length;
        const watched = movies.filter(m => m.status === 'watched' || m.status === 'rewatched').length;
        const watchLater = movies.filter(m => m.status === 'want').length;
        
        let avgRating = 0;
        const ratedMovies = movies.filter(m => m.personalRating > 0);
        if (ratedMovies.length > 0) {
            avgRating = (ratedMovies.reduce((acc, m) => acc + m.personalRating, 0) / ratedMovies.length).toFixed(1);
        }

        // Aggregate Star Section Items
        const allItems = [
            ...movies.map(m => ({...m, _type: 'movie'})),
            ...series.map(s => ({...s, _type: 'series'}))
        ];

        // Star Section items (rating 8 or higher)
        const starItems = allItems
            .filter(item => (item.personalRating || 0) >= 8)
            .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0))
            .slice(0, 10); // Show top 10 favorites

        const recentMovies = movies.slice(0, 5); // top 5 recently added movies

        this.container.innerHTML = `
            <div class="dashboard-header" style="margin-bottom: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Dashboard</h1>
                <p class="text-secondary animate-slide-up delay-100">Welcome back to your cinema universe.</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid animate-slide-up delay-200" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl);">
                
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

            <!-- Star Section (Favorites) -->
            ${starItems.length > 0 ? `
            <div class="section-star animate-slide-up delay-200" style="margin-bottom: var(--spacing-2xl);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h2 style="display: flex; align-items: center; gap: 0.5rem;"><i class="ph ph-star-fill text-gold"></i> Starred Favorites</h2>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-lg);">
                    ${this.generateCards(starItems)}
                </div>
            </div>
            ` : ''}

            <!-- Recently Added -->
            <div class="section-recent animate-slide-up delay-300">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                    <h2>Recently Added Movies</h2>
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
                        ${this.generateCards(recentMovies.map(m => ({...m, _type: 'movie'})), false)}
                    </div>
                `}
            </div>
        `;

        this.attachEventListeners();
    }

    generateCards(items, showBadge = true) {
        return items.map((item, index) => {
            const posterUrl = omdb.getImageUrl(item.poster_path);
            const delay = (index % 5) * 100;
            
            const isMovie = item._type === 'movie';
            const badgeLabel = isMovie ? '🎬 Movie' : '📺 Web Series';
            const badgeHtml = showBadge 
                ? `<span style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.8); color: white; padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px);">${badgeLabel}</span>`
                : '';

            const route = isMovie ? `#movie-detail/${item.id}` : `#series-detail/${item.id}`;

            return `
                <div class="movie-card animate-scale-up" style="animation-delay: ${delay}ms" data-route="${route}">
                    ${badgeHtml}
                    <img src="${posterUrl}" alt="${item.title}" loading="lazy">
                    <div class="movie-card-overlay">
                        <h3 class="movie-title-sm">${item.title}</h3>
                        ${item.personalRating ? `<div style="color: var(--accent-gold); font-size: 0.8rem; font-weight: bold; margin-top: 0.25rem;">⭐ ${item.personalRating}/10</div>` : ''}
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
                if (card.dataset.route) {
                    window.location.hash = card.dataset.route;
                }
            });
        });
    }
}
