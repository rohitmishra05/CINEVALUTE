import { omdb } from '../services/OmdbService.js';
import { storage } from '../services/StorageService.js';

export class SearchController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.searchTimeout = null;
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="search-header" style="margin-bottom: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Discover Movies</h1>
                <p class="text-secondary animate-slide-up delay-100">Find and add new masterpieces to your vault.</p>
            </div>
            
            <div class="search-box animate-slide-up delay-200" style="max-width: 600px; margin: 0 auto var(--spacing-2xl) auto;">
                <div class="input-group">
                    <i class="ph ph-magnifying-glass input-icon" style="font-size: 1.5rem;"></i>
                    <input type="text" id="discover-search-input" class="input-field glass-panel" placeholder="Search by title..." style="font-size: 1.2rem; padding: 1rem 1rem 1rem 3.5rem;">
                </div>
            </div>

            <div class="movie-grid" id="search-results">
                <!-- Results go here -->
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-2xl);">
                    <i class="ph ph-film-strip" style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                    Type a movie name to start searching.
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const searchInput = this.container.querySelector('#discover-search-input');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(this.searchTimeout);
            
            if (query.length < 3) {
                if (query.length === 0) {
                     this.clearResults();
                }
                return;
            }

            this.showLoading();
            
            // Debounce API calls
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 500);
        });
    }

    clearResults() {
        const resultsContainer = this.container.querySelector('#search-results');
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-2xl);">
                <i class="ph ph-film-strip" style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                Type a movie name to start searching.
            </div>
        `;
    }

    showLoading() {
        const resultsContainer = this.container.querySelector('#search-results');
        let skeletons = '';
        for(let i=0; i<8; i++) {
            skeletons += `
                <div class="movie-card skeleton"></div>
            `;
        }
        resultsContainer.innerHTML = skeletons;
    }

    async performSearch(query) {
        const data = await omdb.searchMovies(query);
        const resultsContainer = this.container.querySelector('#search-results');
        
        if (!data || !data.results || data.results.length === 0) {
            resultsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: var(--spacing-2xl);">
                    <p>No movies found for "${query}".</p>
                </div>
            `;
            return;
        }

        // Get saved movies to check what's already in the vault
        const savedMovies = storage.getMovies();
        const savedIds = new Set(savedMovies.map(m => m.id)); // id is now string (imdbID)

        let html = '';
        data.results.forEach((movie, index) => {
            const inVault = savedIds.has(movie.imdbID);
            const posterUrl = omdb.getImageUrl(movie.Poster);
            const year = movie.Year || 'N/A';
            const delay = (index % 10) * 100; // Staggered animation
            
            html += `
                <div class="movie-card animate-scale-up" style="animation-delay: ${delay}ms">
                    <img src="${posterUrl}" alt="${movie.Title}" loading="lazy">
                    <div class="movie-card-overlay">
                        <h3 class="movie-title-sm">${movie.Title}</h3>
                        <div class="movie-info-sm" style="margin-bottom: var(--spacing-sm);">
                            <span>${year}</span>
                        </div>
                        ${inVault 
                            ? `<button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem;" disabled>
                                 <i class="ph ph-check"></i> In Vault
                               </button>`
                            : `<button class="btn btn-primary add-to-vault-btn" data-id="${movie.imdbID}" style="width: 100%; font-size: 0.8rem;">
                                 <i class="ph ph-plus"></i> Add to Vault
                               </button>`
                        }
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;

        // Attach Add buttons events
        resultsContainer.querySelectorAll('.add-to-vault-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const movieId = e.currentTarget.dataset.id;
                await this.addToVault(movieId, e.currentTarget);
            });
        });
    }

    async addToVault(id, btnElement) {
        // Show loading state on button
        btnElement.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Adding...';
        btnElement.classList.add('disabled');
        btnElement.style.pointerEvents = 'none';

        // Fetch full details
        const fullDetails = await omdb.getMovieDetails(id);
        
        if (fullDetails) {
            // Transform OMDb data for local storage
            let runtimeInt = 0;
            if (fullDetails.Runtime && fullDetails.Runtime !== 'N/A') {
                runtimeInt = parseInt(fullDetails.Runtime.split(' ')[0]) || 0;
            }

            const genresArray = fullDetails.Genre !== 'N/A' 
                ? fullDetails.Genre.split(', ').map(g => ({ name: g })) 
                : [];
                
            const castArray = fullDetails.Actors !== 'N/A' 
                ? fullDetails.Actors.split(', ') 
                : [];

            const movieData = {
                id: fullDetails.imdbID,
                title: fullDetails.Title,
                original_title: fullDetails.Title,
                overview: fullDetails.Plot !== 'N/A' ? fullDetails.Plot : 'No overview available.',
                poster_path: fullDetails.Poster !== 'N/A' ? fullDetails.Poster : null,
                backdrop_path: fullDetails.Poster !== 'N/A' ? fullDetails.Poster : null, // OMDb doesn't have backdrops, use poster
                release_date: fullDetails.Released !== 'N/A' ? fullDetails.Released : fullDetails.Year,
                runtime: runtimeInt,
                vote_average: fullDetails.imdbRating !== 'N/A' ? parseFloat(fullDetails.imdbRating) : 0,
                genres: genresArray,
                director: fullDetails.Director !== 'N/A' ? fullDetails.Director : 'Unknown',
                cast: castArray,
            };

            const success = storage.addMovie(movieData);
            
            if (success) {
                // Update UI to show success
                btnElement.className = 'btn btn-secondary';
                btnElement.innerHTML = '<i class="ph ph-check text-gold"></i> In Vault';
                btnElement.disabled = true;
            } else {
                btnElement.innerHTML = 'Error adding';
            }
        } else {
            btnElement.innerHTML = 'Error fetching';
        }
    }
}
