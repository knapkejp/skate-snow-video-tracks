const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');  // Import CORS package
const app = express();
const port = 3000;

// Use the CORS middleware globally
app.use(cors());  // Allow all origins by default (you can customize this if needed)

// Connect to SQLite database (replace with your SQLite database file)
const db = new sqlite3.Database('./Snowboard Video Tracks.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// API to get all songs from the Music table
app.get('/songs', (req, res) => {
  db.all('SELECT * FROM MusicTracks', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return res.status(500).send('Server Error');
    }
    res.json(rows); // Send the data as JSON response
  });
});

// API to get all video and music data
app.get('/get_video_data', (req, res) => {
  // The SQL query to join the tables and return all data
  const sqlQuery = `
    SELECT v.Type, vm.Section, v.Title AS Title, v.Crew, v.Year, v.Director, m.Artist, m.Song
    FROM VideoMusic vm
    JOIN Videos v ON vm.VideoID = v.VideoID
    JOIN MusicTracks m ON vm.TrackID = m.TrackID;
  `;
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return res.status(500).send('Server Error');
    }
    res.json(rows); // Send the data as JSON response
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
