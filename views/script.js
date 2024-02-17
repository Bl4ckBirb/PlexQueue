const { createApp } = Vue;
const tableRows = 10;

createApp({
    data() {
        return {
            searchQuery: '',
            movies: [],
            names: [],
            tableMovies: Array(tableRows).fill().map(() => ({
                title: 'Kein Film ausgewählt',
                requester: '',
                rating: 'Schlecht / Mittel / Gut / Sehr gut'
            })),
            lightMode: false,
            showSearch: false,
            currentEditingIndex: null,
        };
    },
    created() {
        this.fetchNames();
        this.fetchMovies();
    },
    mounted(){
        
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
                this.movies = data.movies.slice(0, 15);
            })
            .catch(error => console.error('Error:', error));
        },
        toggleLightMode() {
            this.lightMode = !this.lightMode;
            if (this.lightMode) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        },
        editMovie(index) {
            this.currentEditingIndex = index;
            this.showSearch = true;
        },
        selectMovie(movie) {
            if (this.currentEditingIndex !== null) {
                // Construct the movie object before setting currentEditingIndex to null
                const updatedMovie = {
                    title: movie.title + " (" + movie.year + ")",
                    requester: this.tableMovies[this.currentEditingIndex].requester,
                    rating: this.tableMovies[this.currentEditingIndex].rating
                };

                // Update the movie in the table
                this.tableMovies[this.currentEditingIndex].title = updatedMovie.title;

                // Now, call saveMovie with the constructed object
                this.saveMovie(updatedMovie);

                // After all actions are done, reset the states
                this.showSearch = false;
                this.searchQuery = ''; // Reset search query
                this.movies = []; // Reset movie results
                this.currentEditingIndex = null; // Reset editing index AFTER using it
            }
        },
        addRow() {
            const newIndex = this.tableMovies.length;
            const newMovie = {
                title: 'Kein Film ausgewählt',
                requester: this.names[newIndex % this.names.length], // Automatically assigns the next name
                rating: 'Schlecht / Mittel / Gut / Sehr gut'
            };
            this.movies.push(newMovie);
        },
        fetchNames() {
            fetch('/names')
                .then(response => response.json())
                .then(data => {
                    this.names = data;
                    this.updateRequesters();
                })
                .catch(error => console.error('Error fetching names:', error));
        },
        updateRequesters() {
            this.tableMovies = this.tableMovies.map((movie, index) => {
                // Check if the requester field is empty before updating it
                const requesterIsEmpty = !movie.requester || movie.requester === 'N/A' || movie.requester.trim() === '';
                return {
                    ...movie,
                    requester: requesterIsEmpty ? this.names[index % this.names.length] || 'Loading...' : movie.requester,
                };
            });
        },
        fetchMovies() {
            fetch('/movies')
                .then(response => response.json())
                .then(data => {
                    // Iterate over fetched data to find and update the matching requester entries.
                    data.forEach(movie => {
                        const indexToUpdate = this.tableMovies.findIndex(tableMovie => 
                            tableMovie.requester === movie.requester && tableMovie.title === 'Kein Film ausgewählt');

                        // If a matching requester is found, update that entry; otherwise, leave the default.
                        if (indexToUpdate !== -1) {
                            this.tableMovies[indexToUpdate] = movie;
                        }
                    });
                })
                .catch(error => console.error('Error fetching movies:', error));
        },
        saveMovie(movie) {
            fetch('/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movie),
            })
            .then(response => response.json())
            .then(data => {
                this.fetchMovies(); // Refresh the list after saving
            })
            .catch(error => console.error('Error saving movie:', error));
        },
    }
}).mount('#app');
