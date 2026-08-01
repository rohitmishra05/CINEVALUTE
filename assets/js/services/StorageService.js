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
                series: [],
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
            const parsed = JSON.parse(data);
            if (parsed && !parsed.series) {
                parsed.series = []; // Ensure backward compatibility
            }
            return parsed;
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

    // --- Web Series ---
    getSeries() {
        return this.getData().series || [];
    }

    addSeries(seriesData) {
        const data = this.getData();
        const exists = data.series.find(s => s.id === seriesData.id);
        if (exists) return false;

        seriesData.addedAt = new Date().toISOString();
        seriesData.status = 'want'; // Default status
        seriesData.personalRating = 0;
        seriesData.notes = {
            review: '',
            storytelling: '',
            cinematography: '',
            acting: '',
            editing: ''
        };
        seriesData.collections = ['watchlist'];

        data.series.unshift(seriesData);
        this.saveData(data);
        return true;
    }

    updateSeries(id, updates) {
        const data = this.getData();
        const index = data.series.findIndex(s => s.id === id);
        if (index !== -1) {
            data.series[index] = { ...data.series[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    deleteSeries(id) {
        const data = this.getData();
        data.series = data.series.filter(s => s.id !== id);
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
