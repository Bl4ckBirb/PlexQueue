const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('views'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_CONN_HOST,
    port: process.env.DB_CONN_PORT,
    user: process.env.DB_CONN_USER,
    password: process.env.DB_CONN_PASSWORD,
    database: process.env.DB_CONN_DATABASE
});

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

app.get('/names', (req, res) => {
    pool.query('SELECT name FROM name_order ORDER BY order_position ASC', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results.map(result => result.name));
    });
});

app.get('/movies', (req, res) => {
    pool.query('SELECT * FROM movies ORDER BY id ASC', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

app.post('/movies', (req, res) => {
    const { title, requester, rating } = req.body;
    const query = 'INSERT INTO movies (title, requester, rating) VALUES (?, ?, ?)';
    pool.query(query, [title, requester, rating], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ id: results.insertId, title, requester, rating });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
