const { createApp } = Vue;

createApp({
    data() {
        return {
            searchQuery: '',
            movies: [],
            darkMode: false // Initial dark mode state
        };
    },
    methods: {
        searchMovies() {
            if (!this.searchQuery.trim()) {
                this.movies = [];
                return;
            }
            
            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: this.searchQuery }),
            })
            .then(response => response.json())
            .then(data => {
                this.movies = data.movies.slice(0, 15); // Limit to the first 15 movies
            })
            .catch(error => console.error('Error:', error));
        },
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            if (this.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        }
    }
}).mount('#app');

