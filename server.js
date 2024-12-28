const express = require('express');  // Import express
const { Pool } = require('pg');  // Import pg for PostgreSQL
const cors = require('cors');  // Import CORS package
const app = express();  // Initialize the app
const port = process.env.PORT || 3000;  // Default to 3000 for local, Heroku provides its own port

// Use the CORS middleware globally
app.use(cors());  // Allow all origins by default (you can customize this if needed)

// Route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Snowboard Video Tracks API');
});

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Always use SSL with Heroku
});


// API to get all video and music data
app.get('/get_video_data', async (req, res) => {
  // The SQL query to join the tables and return all data
  const sqlQuery = `
    SELECT v."Type", vm."Section", v."Title", v."Crew", v."Year", v."Director", m."Artist", m."Song"
    FROM "VideoMusic" vm
    JOIN "Videos" v ON vm."VideoID" = v."VideoID"
    JOIN "MusicTracks" m ON vm."TrackID" = m."TrackID";
  `;
  try {
    const result = await pool.query(sqlQuery);
    res.json(result.rows); // Send the data as JSON response
  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
