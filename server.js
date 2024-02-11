const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('views'));
app.use(bodyParser.json());

async function searchPlex(query) {
    try {
        const response = await axios.get(`${process.env.PLEX_SERVER_URL}/search?query=${encodeURIComponent(query)}`, {
            headers: { 'X-Plex-Token': process.env.PLEX_TOKEN },
            params: {
                type: 1 // Type 1 for movies.
            }
        });
        return response.data.MediaContainer.Metadata.map(movie => ({
            title: movie.title,
            year: movie.year
        }));
    } catch (error) {
        console.error('Error searching Plex Media Server:', error);
        return [];
    }
}

app.post('/search', async (req, res) => {
    const { query } = req.body;
    const movies = await searchPlex(query);
    res.json({ movies });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

