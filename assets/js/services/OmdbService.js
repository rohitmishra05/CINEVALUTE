class OmdbService {
    constructor() {
        this.BASE_URL = 'https://www.omdbapi.com/';
        this.API_KEY = '9145d008';
    }

    getImageUrl(path) {
        if (!path || path === 'N/A') return 'assets/images/no-poster.png';
        return path;
    }

    async searchMovies(query) {
        try {
            const response = await fetch(`${this.BASE_URL}?apikey=${this.API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            // Map to a consistent format
            if (data.Response === "True" && data.Search) {
                return { results: data.Search };
            } else {
                return { results: [] };
            }
        } catch (error) {
            console.error('OMDb Search Error:', error);
            return { results: [] };
        }
    }

    async getMovieDetails(id) {
        try {
            const response = await fetch(`${this.BASE_URL}?apikey=${this.API_KEY}&i=${id}&plot=full`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data.Response === "True") {
                return data;
            } else {
                return null;
            }
        } catch (error) {
            console.error('OMDb Details Error:', error);
            return null;
        }
    }
}

export const omdb = new OmdbService();
