import { storage } from '../services/StorageService.js';

export class SettingsController {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const settings = storage.getSettings();

        this.container.innerHTML = `
            <div class="settings-header" style="margin-bottom: var(--spacing-2xl);">
                <h1 class="animate-slide-up">Settings</h1>
                <p class="text-secondary animate-slide-up delay-100">Configure your CineVault experience.</p>
            </div>

            <div style="max-width: 600px; display: flex; flex-direction: column; gap: var(--spacing-xl);">

                <!-- Data Management -->
                <div class="glass-panel animate-slide-up delay-300" style="padding: var(--spacing-xl);">
                    <h3 style="margin-bottom: var(--spacing-md); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-database text-gold"></i> Data Management
                    </h3>
                    <p class="text-secondary" style="margin-bottom: var(--spacing-md); font-size: 0.9rem;">
                        Your data is currently stored locally in this browser. You can export it to a file to keep a backup.
                    </p>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-secondary" id="btn-export">
                            <i class="ph ph-download-simple"></i> Export Data (JSON)
                        </button>
                        <label class="btn btn-secondary" style="cursor: pointer;">
                            <i class="ph ph-upload-simple"></i> Import Data
                            <input type="file" id="file-import" accept=".json" style="display: none;">
                        </label>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Export Data
        const btnExport = this.container.querySelector('#btn-export');
        btnExport.addEventListener('click', () => {
            const data = localStorage.getItem('cinevault_data');
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cinevault_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        // Import Data
        const fileImport = this.container.querySelector('#file-import');
        fileImport.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data && data.movies && data.collections) {
                        if (!data.series) data.series = []; // Backward compatibility
                        localStorage.setItem('cinevault_data', JSON.stringify(data));
                        alert('Data imported successfully! The page will now reload.');
                        window.location.reload();
                    } else {
                        alert('Invalid backup file format.');
                    }
                } catch (err) {
                    alert('Error parsing the file.');
                }
            };
            reader.readAsText(file);
        });
    }
}
