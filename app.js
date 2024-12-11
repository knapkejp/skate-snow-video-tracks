const express = require('express');  // Import express
const app = express();  // Initialize the app
const port = process.env.PORT || 3000;  // Default to 3000 for local, Heroku provides its own port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Global variables
let allVideos = [];  // Store all videos
let filteredVideos = [];  // Store the filtered videos

let sortColumn = 'Year';  // Default sort by 'Year'
let sortDirection = 'desc';  // Default sort direction is descending

// Function to fetch the video data from the API
function fetchVideos() {
  fetch('http://localhost:3000/get_video_data')  // API endpoint to fetch video data
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
      allVideos = data;  // Save all video data globally
      filteredVideos = allVideos;  // Initially, no filter is applied
      displayVideos(filteredVideos);  // Display all videos sorted by year
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      alert('Failed to load video data.');
    });
}

// Function to display videos in the table
function displayVideos(videos) {
  // Sort videos by the current sort column and direction
  videos.sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const videoListContainer = document.querySelector('#video-list tbody');
  videoListContainer.innerHTML = '';  // Clear any existing content

  // Loop through the sorted video data and create table rows
  videos.forEach(video => {
    const videoRow = document.createElement('tr');  // Create a table row for each video

    // Determine the image for the "Type" column
    let typeImage = '';
    if (video.Type === 'Snow') {
      typeImage = '<img src="images/Snow Flake.png" alt="Snow" style="width: 30px; height: auto;" />';
    } else if (video.Type === 'Skate') {
      typeImage = '<img src="images/Skate Wheel.png" alt="Skate" style="width: 30px; height: auto;" />';
    } else {
      typeImage = video.Type;  // Default: display the text if the type doesn't match Snow or Skate
    }

    // Add the rest of the video data to the row
    videoRow.innerHTML = `
      <td>${typeImage}</td>  <!-- Updated "type" column with image -->
      <td><span class="section">${video.Section}</span></td>
      <td>${video.Crew}</td>
      <td class="title">${video.Title}</td>
      <td class="year">${video.Year}</td>
      <td>${video.Director}</td>
      <td>${video.Song}</td>
      <td>${video.Artist}</td>
    `;

    // Append the row to the table body
    videoListContainer.appendChild(videoRow);
  });

  // Update the arrows for sorting indicators
  updateSortIndicators();
}

// Function to handle column header click for sorting
function sortColumnBy(column) {
  if (sortColumn === column) {
    // Toggle sort direction if the same column is clicked
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // Default to descending if a new column is clicked
    sortColumn = column;
    sortDirection = 'desc';
  }

  // Sort and display videos after column click
  displayVideos(filteredVideos);
}

// Function to update sort arrows in the table headers
function updateSortIndicators() {
  // Reset all arrows
  document.querySelectorAll('#video-list th').forEach(th => {
    th.innerHTML = th.innerHTML.replace(/↑|↓/, '');  // Remove existing arrows
  });

  // Add the appropriate arrow to the active sorted column
  const sortedColumnHeader = document.querySelector(`#video-list th[data-column="${sortColumn}"]`);
  if (sortedColumnHeader) {
    const arrow = sortDirection === 'asc' ? '↑' : '↓';
    sortedColumnHeader.innerHTML += ` ${arrow}`;
  }
}

// Function to filter videos based on the selected type (All, Snow, Skate)
function filterByType(type) {
  // Update the active class on buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.classList.remove('active');
  });

  // Set the clicked button as active
  document.getElementById(`${type.toLowerCase()}-btn`).classList.add('active');

  // Filter the videos by type
  let filteredByType = [];
  if (type === 'All') {
    filteredByType = allVideos;  // Show all videos
  } else {
    filteredByType = allVideos.filter(video => video.Type === type);
  }

  // Apply the sorting after filtering
  filteredByType.sort((a, b) => b.Year - a.Year);

  // Display the filtered and sorted videos
  filteredVideos = filteredByType;
  displayVideos(filteredVideos);
}

// Function to filter videos based on the search input, while respecting the current type filter
function filterVideos() {
  const searchQuery = document.getElementById('search-input').value.toLowerCase();  // Get the search input

  // Filter based on the current type filter
  let filteredByType = filteredVideos;

  // If a type filter is applied (i.e., "Snow" or "Skate"), narrow down the set before applying search
  if (document.getElementById('snow-btn').classList.contains('active')) {
    filteredByType = allVideos.filter(video => video.Type === 'Snow');
  } else if (document.getElementById('skate-btn').classList.contains('active')) {
    filteredByType = allVideos.filter(video => video.Type === 'Skate');
  } else {
    filteredByType = allVideos;  // "All" is selected, show all videos
  }

  // Now apply the search query filter on top of the selected type filter
  filteredVideos = filteredByType.filter(video => {
    return (
      video.Type.toLowerCase().includes(searchQuery) ||
      video.Section.toLowerCase().includes(searchQuery) ||
      video.Crew.toLowerCase().includes(searchQuery) ||
      video.Title.toLowerCase().includes(searchQuery) ||
      video.Year.toString().includes(searchQuery) ||
      video.Director.toLowerCase().includes(searchQuery) ||
      video.Song.toLowerCase().includes(searchQuery) ||
      video.Artist.toLowerCase().includes(searchQuery)
    );
  });

  // Sort the filtered and searched results by the current sort column and direction
  filteredVideos.sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Display the filtered and sorted videos
  displayVideos(filteredVideos);
}

// Initialize page
if (typeof window !== "undefined") {
  window.onload = function() {
    fetchVideos();  // Fetch the videos
    filterByType('All');  // Set "All" filter as the default on page load
  };
}
