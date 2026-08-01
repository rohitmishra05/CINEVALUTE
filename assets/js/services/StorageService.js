/**
 * StorageService
 * Wrapper around LocalStorage to handle saving/loading CineVault data.
 */
class StorageService {
    constructor() {
        this.STORAGE_KEY = 'cinevault_data';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const defaultData = {
                movies: [],
                collections: [
                    { id: 'fav', name: 'Favorites', description: 'My all-time favorite movies.' },
                    { id: 'watchlist', name: 'Watchlist', description: 'Movies I want to watch.' }
                ],
                settings: {
                    theme: 'dark'
                }
            };
            this.saveData(defaultData);
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return JSON.parse(data);
        } catch (e) {
            console.error("Error reading from local storage", e);
            return null;
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error saving to local storage", e);
        }
    }

    // --- Movies ---
    getMovies() {
        return this.getData().movies;
    }

    addMovie(movieData) {
        const data = this.getData();
        // Check if exists
        const exists = data.movies.find(m => m.id === movieData.id);
        if (exists) return false; // Already in vault

        // Add metadata
        movieData.addedAt = new Date().toISOString();
        movieData.status = 'want'; // Default status
        movieData.personalRating = 0;
        movieData.notes = {
            review: '',
            storytelling: '',
            cinematography: '',
            acting: '',
            editing: ''
        };
        movieData.collections = ['watchlist'];

        data.movies.unshift(movieData);
        this.saveData(data);
        return true;
    }

    updateMovie(id, updates) {
        const data = this.getData();
        const index = data.movies.findIndex(m => m.id === id);
        if (index !== -1) {
            data.movies[index] = { ...data.movies[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    deleteMovie(id) {
        const data = this.getData();
        data.movies = data.movies.filter(m => m.id !== id);
        this.saveData(data);
    }

    // --- Settings ---
    getSettings() {
        return this.getData().settings;
    }

    updateSettings(updates) {
        const data = this.getData();
        data.settings = { ...data.settings, ...updates };
        this.saveData(data);
    }
}

// Export a singleton instance
export const storage = new StorageService();
