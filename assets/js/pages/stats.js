import { storage } from '../services/StorageService.js';

export class StatsController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const movies = storage.getMovies() || [];
        const watchedMovies = movies.filter(m => m.status === 'watched' || m.status === 'rewatched');
        
        let totalRuntime = 0;
        const genreCounts = {};
        const directorCounts = {};
        
        watchedMovies.forEach(m => {
            totalRuntime += (m.runtime || 0);
            
            if (m.genres) {
                m.genres.forEach(g => {
                    genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
                });
            }

            if (m.director && m.director !== 'Unknown') {
                directorCounts[m.director] = (directorCounts[m.director] || 0) + 1;
            }
        });

        const totalHours = Math.floor(totalRuntime / 60);
        
        // Sort genres and directors
        const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        this.container.innerHTML = `
            <div class="stats-header" style="margin-bottom: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Statistics</h1>
                <p class="text-secondary animate-slide-up delay-100">Analyze your cinematic habits.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-xl);">
                
                <!-- Time Watched -->
                <div class="glass-panel animate-scale-up delay-200" style="padding: var(--spacing-xl); text-align: center;">
                    <h3 style="color: var(--text-secondary); margin-bottom: 1rem;">Total Time Watched</h3>
                    <div style="font-size: 3.5rem; font-weight: 700; font-family: var(--font-display); color: var(--accent-gold); line-height: 1;">
                        ${totalHours}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 1.2rem; margin-top: 0.5rem;">Hours</div>
                </div>

                <!-- Top Genres -->
                <div class="glass-panel animate-scale-up delay-300" style="padding: var(--spacing-xl);">
                    <h3 style="color: var(--text-secondary); margin-bottom: 1.5rem;">Favorite Genres</h3>
                    ${topGenres.length > 0 ? topGenres.map(([genre, count], index) => {
                        const percentage = (count / watchedMovies.length) * 100;
                        return `
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.9rem;">
                                    <span>${genre}</span>
                                    <span class="text-secondary">${count}</span>
                                </div>
                                <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${percentage}%; height: 100%; background: var(--accent-gold); border-radius: 4px;"></div>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="text-secondary">Watch more movies to see stats.</p>'}
                </div>

                <!-- Top Directors -->
                <div class="glass-panel animate-scale-up delay-400" style="padding: var(--spacing-xl);">
                    <h3 style="color: var(--text-secondary); margin-bottom: 1.5rem;">Top Directors</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${topDirectors.length > 0 ? topDirectors.map(([director, count], index) => `
                            <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span style="font-weight: 500;">${index + 1}. ${director}</span>
                                <span class="badge">${count}</span>
                            </li>
                        `).join('') : '<p class="text-secondary">Watch more movies to see stats.</p>'}
                    </ul>
                </div>
            </div>
        `;
    }
}
