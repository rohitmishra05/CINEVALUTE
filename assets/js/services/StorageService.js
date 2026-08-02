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
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) {
            const defaultData = {
                movies: [],
                series: [],
                collections: [
                    { id: 'fav', name: 'Favorites', description: 'My all-time favorite movies.' },
                    { id: 'watchlist', name: 'Watchlist', description: 'Movies I want to watch.' }
                ],
                selectedCollectionId: 'watchlist',
                settings: {
                    theme: 'dark'
                }
            };
            this.saveData(defaultData);
        } else {
            const data = this.getData();
            let dirty = false;
            if (data) {
                if (!data.series) {
                    data.series = [];
                    dirty = true;
                }
                if (!data.collections || data.collections.length === 0) {
                    data.collections = [
                        { id: 'fav', name: 'Favorites', description: 'My all-time favorite movies.' },
                        { id: 'watchlist', name: 'Watchlist', description: 'Movies I want to watch.' }
                    ];
                    dirty = true;
                }
                if (!data.selectedCollectionId) {
                    data.selectedCollectionId = 'watchlist';
                    dirty = true;
                }
                if (dirty) {
                    this.saveData(data);
                }
            }
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const parsed = JSON.parse(data);
            if (parsed) {
                if (!parsed.series) parsed.series = [];
                if (!parsed.collections) parsed.collections = [];
                if (!parsed.selectedCollectionId) parsed.selectedCollectionId = 'watchlist';
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

    // --- Collections ---
    getCollections() {
        const data = this.getData();
        return data ? data.collections || [] : [];
    }

    getSelectedCollectionId() {
        const data = this.getData();
        if (!data) return 'watchlist';
        const cols = data.collections || [];
        const exists = cols.find(c => c.id === data.selectedCollectionId);
        if (exists) return data.selectedCollectionId;
        return cols.length > 0 ? cols[0].id : 'watchlist';
    }

    setSelectedCollectionId(id) {
        const data = this.getData();
        if (data) {
            data.selectedCollectionId = id;
            this.saveData(data);
        }
    }

    addCollection(name, description) {
        const data = this.getData();
        if (!data) return null;
        
        // Generate unique ID
        const id = 'col_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const newCol = {
            id: id,
            name: name.trim(),
            description: (description || 'Custom collection.').trim(),
            createdAt: new Date().toISOString()
        };

        data.collections.push(newCol);
        data.selectedCollectionId = id; // Automatically select the newly created collection
        this.saveData(data);
        return newCol;
    }

    updateCollection(id, updates) {
        const data = this.getData();
        if (!data) return false;
        const index = data.collections.findIndex(c => c.id === id);
        if (index !== -1) {
            data.collections[index] = { ...data.collections[index], ...updates };
            this.saveData(data);
            return true;
        }
        return false;
    }

    deleteCollection(id) {
        const data = this.getData();
        if (!data) return false;

        // Remove collection
        data.collections = data.collections.filter(c => c.id !== id);

        // Clean up references in movies & series
        if (data.movies) {
            data.movies.forEach(m => {
                if (m.collections) {
                    m.collections = m.collections.filter(cId => cId !== id);
                }
            });
        }
        if (data.series) {
            data.series.forEach(s => {
                if (s.collections) {
                    s.collections = s.collections.filter(cId => cId !== id);
                }
            });
        }

        // Reset selected collection if needed
        if (data.selectedCollectionId === id) {
            data.selectedCollectionId = data.collections.length > 0 ? data.collections[0].id : 'watchlist';
        }

        this.saveData(data);
        return true;
    }

    // --- Movies ---
    getMovies() {
        return this.getData().movies || [];
    }

    addMovie(movieData, collectionIds = null) {
        const data = this.getData();
        let targetCols = [];
        if (Array.isArray(collectionIds)) {
            targetCols = collectionIds;
        } else if (typeof collectionIds === 'string' && collectionIds) {
            targetCols = [collectionIds];
        } else {
            targetCols = [this.getSelectedCollectionId()];
        }

        // Check if movie already exists
        const existingMovie = data.movies.find(m => m.id === movieData.id);
        if (existingMovie) {
            existingMovie.collections = targetCols;
            this.saveData(data);
            return true;
        }

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
        movieData.collections = targetCols;

        data.movies.unshift(movieData);
        this.saveData(data);
        return true;
    }

    toggleMovieCollection(movieId, collectionId) {
        const data = this.getData();
        const movie = data.movies.find(m => m.id === movieId);
        if (movie) {
            if (!movie.collections) movie.collections = [];
            const idx = movie.collections.indexOf(collectionId);
            if (idx > -1) {
                movie.collections.splice(idx, 1);
            } else {
                movie.collections.push(collectionId);
            }
            this.saveData(data);
            return true;
        }
        return false;
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

    addSeries(seriesData, collectionIds = null) {
        const data = this.getData();
        let targetCols = [];
        if (Array.isArray(collectionIds)) {
            targetCols = collectionIds;
        } else if (typeof collectionIds === 'string' && collectionIds) {
            targetCols = [collectionIds];
        } else {
            targetCols = [this.getSelectedCollectionId()];
        }

        const existingSeries = data.series.find(s => s.id === seriesData.id);
        if (existingSeries) {
            existingSeries.collections = targetCols;
            this.saveData(data);
            return true;
        }

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
        seriesData.collections = targetCols;

        data.series.unshift(seriesData);
        this.saveData(data);
        return true;
    }

    toggleSeriesCollection(seriesId, collectionId) {
        const data = this.getData();
        const series = data.series.find(s => s.id === seriesId);
        if (series) {
            if (!series.collections) series.collections = [];
            const idx = series.collections.indexOf(collectionId);
            if (idx > -1) {
                series.collections.splice(idx, 1);
            } else {
                series.collections.push(collectionId);
            }
            this.saveData(data);
            return true;
        }
        return false;
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
        const data = this.getData();
        return data ? data.settings : { theme: 'dark' };
    }

    updateSettings(updates) {
        const data = this.getData();
        if (data) {
            data.settings = { ...data.settings, ...updates };
            this.saveData(data);
        }
    }
}

// Export a singleton instance
export const storage = new StorageService();
