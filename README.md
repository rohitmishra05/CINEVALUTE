# 🎬 CineVault

> **Your Personal Cinema Universe**

CineVault is a premium, cinematic web application designed to be your personal second brain for cinema. It allows you to track movies, write filmmaking notes, organize custom collections, analyze your watching habits, and discover new films through a luxurious, immersive interface.

---

## ✨ Features

- **Personal Movie Vault**: Track movies with statuses (Want to Watch, Watching, Watched, Rewatched) and personal ratings.
- **Filmmaker Notes**: Write and save private notes, reviews, and references for every film.
- **Custom Collections**: Create and organize limitless custom collections to categorize your vault.
- **Advanced Statistics**: Visualize your watching habits, including total runtime watched, genre breakdowns, and completion rates.
- **Random Picker**: A cinematic "roulette" tool that randomly selects an unwatched movie from your vault for movie night.
- **Live Search & Discovery**: Search the global OMDb database in real-time.
- **Data Portability**: Full data export (JSON) and import functionality.
- **100% Responsive**: A premium layout that adapts beautifully to desktop, tablet, and mobile viewing.
- **Luxurious UI**: A fully custom cinematic design system utilizing deep blacks, crimson accents, glassmorphism, and hardware-accelerated animations.

---

## 🛠️ Technologies Used

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+ Modules)
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables, CSS Grid/Flexbox)
- **Architecture**: Object-Oriented Controller Pattern, SPA Hash Routing
- **Storage**: Browser LocalStorage API
- **Data Source**: [OMDb API](http://www.omdbapi.com/)
- **Icons**: Phosphor Icons

*No frontend frameworks (React, Vue) or CSS frameworks (Tailwind, Bootstrap) were used. The application is built entirely from scratch to ensure maximum performance and granular design control.*

---

## 🚀 Installation & Local Setup

Because CineVault uses ES6 Modules (`import`/`export`), it must be served via a local web server (running it directly via `file://` will cause CORS errors).

### Prerequisites
- You need a free OMDb API Key. Get one at [OMDb API](http://www.omdbapi.com/apikey.aspx).
- Python or Node.js (to run a local server).

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CineVault.git
   cd CineVault
   ```

2. **Configure API Key**
   - Rename `assets/js/config.example.js` to `assets/js/config.js`
   - Open `assets/js/config.js` and insert your OMDb API key:
     ```javascript
     export const CONFIG = {
         OMDB_API_KEY: 'YOUR_API_KEY_HERE'
     };
     ```

3. **Start a local development server**
   
   If you have **Python** installed:
   ```bash
   python -m http.server 8000
   ```
   
   *Alternative: If you have Node.js / npm installed:*
   ```bash
   npx serve .
   ```

4. **Open the app**
   Navigate to `http://localhost:8000` in your web browser.

---

## 📸 Screenshots

*(Add screenshots of your application here)*
- Dashboard & Stats
- Movie Detail & Filmmaker Notes
- Collections Management
- Random Movie Picker

---

## 🛣️ Future Roadmap

- **Backend Integration**: Migrate `StorageService` from LocalStorage to Supabase or Firebase for cross-device syncing.
- **Authentication**: Add user accounts.
- **Social Features**: Share collections or reviews with friends.
- **Advanced Filtering**: Filter vault by release decade, director, and custom tags.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).