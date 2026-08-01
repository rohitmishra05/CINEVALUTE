import { storage } from './services/StorageService.js';

class App {
    constructor() {
        this.currentRoute = '';
        this.routes = ['home', 'search', 'movies', 'collections', 'stats', 'picker', 'settings', 'movie-detail', 'series', 'series-search', 'series-detail'];
        
        // Controller instances cache
        this.controllers = {};
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.handleRoute();
        
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    handleRoute() {
        const hash = window.location.hash.substring(1);
        let route = 'home';
        let params = null;

        if (hash) {
            const parts = hash.split('/');
            if (this.routes.includes(parts[0])) {
                route = parts[0];
                if (parts.length > 1) {
                    params = parts.slice(1);
                }
            }
        }

        this.currentRoute = route;
        this.updateView(route, params);
        this.updatePageTitle(route);
        this.updateActiveNav(route);
    }

    async updateView(route, params) {
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });

        const activeView = document.getElementById(`view-${route}`);
        if (activeView) {
            activeView.classList.add('active');
        }

        await this.loadPageController(route, params);
    }

    updatePageTitle(route) {
        const titles = {
            'home': 'Dashboard',
            'search': 'Discover Movies',
            'movies': 'My Movies',
            'collections': 'Collections',
            'stats': 'Statistics',
            'picker': 'Random Picker',
            'settings': 'Settings',
            'movie-detail': 'Movie Details',
            'series': 'My Web Series',
            'series-search': 'Discover Series',
            'series-detail': 'Series Details'
        };
        const titleEl = document.getElementById('current-page-title');
        if (titleEl) {
            titleEl.textContent = titles[route] || 'CineVault';
        }
    }

    updateActiveNav(route) {
        let baseRoute = route;
        if (route === 'movie-detail') baseRoute = 'movies';
        if (route === 'series-detail') baseRoute = 'series';
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.route === baseRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    async loadPageController(route, params) {
        try {
            if (route === 'home') {
                const { HomeController } = await import('./pages/home.js');
                this.controllers.home = new HomeController(`view-${route}`);
            } 
            else if (route === 'search') {
                const { SearchController } = await import('./pages/search.js');
                this.controllers.search = new SearchController(`view-${route}`);
            }
            else if (route === 'movies') {
                const { MoviesController } = await import('./pages/movies.js');
                this.controllers.movies = new MoviesController(`view-${route}`);
            }
            else if (route === 'collections') {
                const { CollectionsController } = await import('./pages/collections.js');
                this.controllers.collections = new CollectionsController(`view-${route}`);
            }
            else if (route === 'movie-detail') {
                const { MovieDetailController } = await import('./pages/movie-detail.js');
                this.controllers.movieDetail = new MovieDetailController(`view-${route}`, params);
            }
            else if (route === 'stats') {
                const { StatsController } = await import('./pages/stats.js');
                this.controllers.stats = new StatsController(`view-${route}`);
            }
            else if (route === 'picker') {
                const { PickerController } = await import('./pages/picker.js');
                this.controllers.picker = new PickerController(`view-${route}`);
            }
            else if (route === 'settings') {
                const { SettingsController } = await import('./pages/settings.js');
                this.controllers.settings = new SettingsController(`view-${route}`);
            }
            else if (route === 'series') {
                const { SeriesController } = await import('./pages/series.js');
                this.controllers.series = new SeriesController(`view-${route}`);
            }
            else if (route === 'series-search') {
                const { SeriesSearchController } = await import('./pages/series-search.js');
                this.controllers.seriesSearch = new SeriesSearchController(`view-${route}`);
            }
            else if (route === 'series-detail') {
                const { SeriesDetailController } = await import('./pages/series-detail.js');
                this.controllers.seriesDetail = new SeriesDetailController(`view-${route}`, params);
            }
            // Add other routes here as we build them...
            else {
                const view = document.getElementById(`view-${route}`);
                if (view) {
                    view.innerHTML = `
                        <div style="text-align: center; padding: 5rem 0;">
                            <i class="ph ph-wrench" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
                            <h2>${route.charAt(0).toUpperCase() + route.slice(1)} Page</h2>
                            <p class="text-secondary">This section is currently under construction.</p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error(`Error loading controller for route ${route}:`, error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cinevault = new App();
});
