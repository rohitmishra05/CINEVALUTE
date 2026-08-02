import { storage } from '../services/StorageService.js';
import { omdb } from '../services/OmdbService.js';
import { CollectionModal } from '../components/CollectionModal.js';

export class SeriesDetailController {
    constructor(containerId, params) {
        this.container = document.getElementById(containerId);
        this.seriesId = params ? params[0] : null;
        this.series = null;
        
        if (this.seriesId) {
            this.loadSeries();
        } else {
            this.container.innerHTML = `<p>Web Series not found.</p>`;
        }
    }

    loadSeries() {
        const allSeries = storage.getSeries();
        this.series = allSeries.find(s => s.id === this.seriesId);
        
        if (this.series) {
            this.render();
        } else {
            this.container.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-2xl);">
                    <h2>Web Series not found in your vault.</h2>
                    <a href="#series-search" class="btn btn-primary" style="margin-top: 1rem;">Search Web Series</a>
                </div>
            `;
        }
    }

    render() {
        const backdropUrl = omdb.getImageUrl(this.series.poster_path);
        const posterUrl = omdb.getImageUrl(this.series.poster_path);
        const year = this.series.release_date ? this.series.release_date.split('-')[0] : '';
        const genres = this.series.genres ? this.series.genres.map(g => g.name).join(', ') : '';

        this.container.innerHTML = `
            <!-- Hero Section with Blurred Poster -->
            <div class="hero-banner animate-fade-in" style="
                position: relative; 
                margin: calc(var(--spacing-2xl) * -1) calc(var(--spacing-2xl) * -1) var(--spacing-2xl) calc(var(--spacing-2xl) * -1);
                height: 40vh;
                min-height: 300px;
                background-image: url('${backdropUrl}');
                background-size: cover;
                background-position: center 20%;
            ">
                <!-- Heavy blur and gradient overlay -->
                <div style="
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(5,5,5,0.6) 0%, var(--bg-primary) 100%);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                "></div>
            </div>

            <!-- Content Layout -->
            <div style="display: grid; grid-template-columns: 300px 1fr; gap: var(--spacing-2xl); position: relative; margin-top: -150px; z-index: 10;">
                
                <!-- Left Column (Poster & Actions) -->
                <div class="sidebar-column animate-slide-up">
                    <img src="${posterUrl}" alt="${this.series.title}" style="width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-glass); margin-bottom: var(--spacing-lg);">
                    
                    <div class="glass-panel" style="padding: var(--spacing-lg); margin-bottom: var(--spacing-lg);">
                        <h3 style="margin-bottom: var(--spacing-sm);">Watch Status</h3>
                        <select id="status-select" class="input-field" style="margin-bottom: var(--spacing-md);">
                            <option value="want" ${this.series.status === 'want' ? 'selected' : ''}>Want to Watch</option>
                            <option value="watching" ${this.series.status === 'watching' ? 'selected' : ''}>Watching</option>
                            <option value="watched" ${this.series.status === 'watched' ? 'selected' : ''}>Watched</option>
                            <option value="rewatched" ${this.series.status === 'rewatched' ? 'selected' : ''}>Rewatched</option>
                        </select>

                        <h3 style="margin-bottom: var(--spacing-sm);">Personal Rating</h3>
                        <div style="display: flex; gap: 0.25rem; align-items: center; margin-bottom: var(--spacing-md);" id="rating-stars">
                            ${this.generateStars(this.series.personalRating || 0)}
                        </div>
                        <span id="rating-value" class="text-gold" style="font-weight: bold; display: block; margin-bottom: var(--spacing-md);">${this.series.personalRating || 0} / 10</span>

                        <h3 style="margin-bottom: var(--spacing-sm); margin-top: var(--spacing-md); display: flex; align-items: center; gap: 0.5rem;"><i class="ph ph-folders text-gold"></i> Add to Collection</h3>
                        <div class="collections-checklist" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 140px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
                            ${(storage.getCollections() || []).map(c => {
                                const inCol = (this.series.collections || []).includes(c.id);
                                return `
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; cursor: pointer; color: var(--text-secondary);">
                                        <input type="checkbox" class="col-checkbox" data-col-id="${c.id}" ${inCol ? 'checked' : ''}>
                                        <span>${c.name}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                        <button id="btn-open-col-modal" class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                            <i class="ph ph-sliders text-gold"></i> Select Collections
                        </button>
                    </div>

                    <button class="btn btn-secondary" style="width: 100%; color: #fa5252; border-color: rgba(250, 82, 82, 0.3);" id="btn-delete">
                        <i class="ph ph-trash"></i> Remove from Vault
                    </button>
                </div>

                <!-- Right Column (Details & Notes) -->
                <div class="main-column animate-slide-up delay-100">
                    <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">${this.series.title} <span style="font-weight: 300; color: var(--text-secondary);">(${year})</span></h1>
                    
                    <div style="display: flex; gap: 1rem; color: var(--text-secondary); margin-bottom: var(--spacing-lg); font-size: 0.9rem; flex-wrap: wrap;">
                        <span><i class="ph ph-list-numbers"></i> ${this.series.totalSeasons ? this.series.totalSeasons + ' Seasons' : 'TBD Seasons'}</span>
                        <span><i class="ph ph-film-strip"></i> ${genres}</span>
                        <span><i class="ph ph-star text-gold"></i> IMDb: ${this.series.vote_average.toFixed(1)}</span>
                    </div>

                    <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: var(--spacing-xl); color: var(--text-primary);">
                        ${this.series.overview}
                    </p>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl);">
                        <div class="glass-panel" style="padding: var(--spacing-lg);">
                            <h3 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Creator</h3>
                            <p style="font-weight: 500; font-size: 1.1rem;">${this.series.director || 'Unknown'}</p>
                        </div>
                        <div class="glass-panel" style="padding: var(--spacing-lg);">
                            <h3 style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">Top Cast</h3>
                            <p style="font-weight: 500;">${this.series.cast ? this.series.cast.join(', ') : 'Unknown'}</p>
                        </div>
                    </div>

                    <!-- Filmmaker Notes Section -->
                    <h2 style="margin-bottom: var(--spacing-lg); padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">Show Notes</h2>
                    
                    <div class="notes-container" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
                        ${this.generateNoteSection('review', 'General Review & Thoughts')}
                        ${this.generateNoteSection('storytelling', 'Storytelling & Screenplay')}
                        ${this.generateNoteSection('cinematography', 'Cinematography & Lighting')}
                        ${this.generateNoteSection('editing', 'Editing & Pacing')}
                        ${this.generateNoteSection('acting', 'Acting & Character Arc')}
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    generateStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 10; i++) {
            const isFilled = i <= rating;
            starsHtml += `<i class="ph ${isFilled ? 'ph-star-fill text-gold' : 'ph-star'} star-rating" data-value="${i}" style="font-size: 1.25rem; cursor: pointer; transition: transform 0.1s;"></i>`;
        }
        return starsHtml;
    }

    generateNoteSection(key, title) {
        const content = this.series.notes && this.series.notes[key] ? this.series.notes[key] : '';
        return `
            <div class="note-section glass-panel" style="padding: var(--spacing-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                    <h3 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-pencil-simple text-gold"></i> ${title}
                    </h3>
                    <button class="btn-icon save-note-btn" data-key="${key}" style="width: 32px; height: 32px;" title="Save Note">
                        <i class="ph ph-floppy-disk"></i>
                    </button>
                </div>
                <textarea class="input-field note-textarea" data-key="${key}" rows="4" placeholder="Write your notes here...">${content}</textarea>
            </div>
        `;
    }

    attachEventListeners() {
        // Status Change
        const statusSelect = this.container.querySelector('#status-select');
        statusSelect.addEventListener('change', (e) => {
            storage.updateSeries(this.series.id, { status: e.target.value });
        });

        // Collection Checkboxes
        const colCheckboxes = this.container.querySelectorAll('.col-checkbox');
        colCheckboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const colId = e.target.dataset.colId;
                storage.toggleSeriesCollection(this.series.id, colId);
                if (!this.series.collections) this.series.collections = [];
                const idx = this.series.collections.indexOf(colId);
                if (idx > -1) this.series.collections.splice(idx, 1);
                else this.series.collections.push(colId);
            });
        });

        // Collection Modal Button
        const btnOpenColModal = this.container.querySelector('#btn-open-col-modal');
        if (btnOpenColModal) {
            btnOpenColModal.addEventListener('click', () => {
                CollectionModal.open({
                    title: `Select Collections`,
                    initialSelectedIds: this.series.collections || [],
                    onSave: (selectedIds) => {
                        storage.addSeries(this.series, selectedIds);
                        this.series.collections = selectedIds;
                        this.render();
                    }
                });
            });
        }

        // Rating Stars
        const stars = this.container.querySelectorAll('.star-rating');
        const ratingVal = this.container.querySelector('#rating-value');
        
        stars.forEach(star => {
            star.addEventListener('mouseover', (e) => {
                const val = parseInt(e.target.dataset.value);
                stars.forEach(s => {
                    const sVal = parseInt(s.dataset.value);
                    if (sVal <= val) {
                        s.classList.add('ph-star-fill', 'text-gold');
                        s.classList.remove('ph-star');
                    } else {
                        s.classList.remove('ph-star-fill', 'text-gold');
                        s.classList.add('ph-star');
                    }
                });
            });

            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.dataset.value);
                storage.updateSeries(this.series.id, { personalRating: val });
                this.series.personalRating = val;
                ratingVal.textContent = `${val} / 10`;
            });
        });

        // Reset stars on mouseleave if not clicked
        const starsContainer = this.container.querySelector('#rating-stars');
        starsContainer.addEventListener('mouseleave', () => {
            starsContainer.innerHTML = this.generateStars(this.series.personalRating || 0);
            this.attachEventListeners(); 
        });

        // Save Notes
        const saveBtns = this.container.querySelectorAll('.save-note-btn');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                const textarea = this.container.querySelector(`textarea[data-key="${key}"]`);
                const content = textarea.value;

                const currentNotes = this.series.notes || {};
                currentNotes[key] = content;

                storage.updateSeries(this.series.id, { notes: currentNotes });
                
                // Visual feedback
                const icon = btn.querySelector('i');
                icon.className = 'ph ph-check text-gold';
                setTimeout(() => {
                    icon.className = 'ph ph-floppy-disk';
                }, 2000);
            });
        });

        // Auto-save on blur
        const textareas = this.container.querySelectorAll('.note-textarea');
        textareas.forEach(ta => {
            ta.addEventListener('blur', (e) => {
                const key = e.target.dataset.key;
                const content = e.target.value;
                const currentNotes = this.series.notes || {};
                currentNotes[key] = content;
                storage.updateSeries(this.series.id, { notes: currentNotes });
            });
        });

        // Delete Series
        const btnDelete = this.container.querySelector('#btn-delete');
        btnDelete.addEventListener('click', () => {
            if (confirm(`Are you sure you want to remove "${this.series.title}" from your vault?`)) {
                storage.deleteSeries(this.series.id);
                window.location.hash = '#series';
            }
        });
    }
}
