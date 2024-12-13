// API konfiguration för att hämta filmdata samt personliga API nyckeln
const API_KEY = '34a3a84e40cb412a83d35dc3d683b406';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Kategorier med genre ID-n från TMDB API
const CATEGORIES = {
  action: 28,
  comedy: 35,
  sciFi: 878,
  drama: 18,
  thriller: 53,
  horror: 27
};

// Hämtar HTML element från DOM
const moviesGrid = document.getElementById('movies-grid');
const searchBar = document.getElementById('search-bar');
const categorySelect = document.getElementById('category-select');

// Lägger till klick event för genre knappar
// Varje knapp hämtar filmer från en specifik genre
document.getElementById('action-btn').addEventListener('click', () => fetchMovies('action'));
document.getElementById('comedy-btn').addEventListener('click', () => fetchMovies('comedy'));
document.getElementById('sci-fi-btn').addEventListener('click', () => fetchMovies('sciFi'));
document.getElementById('drama-btn').addEventListener('click', () => fetchMovies('drama'));
document.getElementById('thriller-btn').addEventListener('click', () => fetchMovies('thriller'));
document.getElementById('horror-btn').addEventListener('click', () => fetchMovies('horror'));

// Ändrings event för kategori och sökfält
categorySelect.addEventListener('change', (e) => fetchMovies(e.target.value));
searchBar.addEventListener('input', () => fetchMovies(categorySelect.value, searchBar.value));

// Funktion för att hämta filmer baserat på kategori och sökord
async function fetchMovies(category = 'all', searchTerm = '') {
  try {
    let movies = [];

    if (category === 'all') {
      // Hämta populära, topprankade och kommande filmer
      const popular = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=sv-SE&page=1`).then(res => res.json());
      const topRated = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=sv-SE&page=1`).then(res => res.json());
      const upcoming = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=sv-SE&page=1`).then(res => res.json());
      movies = [...popular.results, ...topRated.results, ...upcoming.results];
      displayChart(movies, 'all');
    } else if (category === 'popular' || category === 'top_rated' || category === 'upcoming') {
      // Hämta filmer baserat på API slug (t.ex. popular, top_rated)
      const response = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}&language=sv-SE&page=1`);
      const data = await response.json();
      movies = data.results;
    } else if (CATEGORIES[category]) {
      // Hämta filmer baserat på genre ID
      const categoryId = CATEGORIES[category];
      const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${categoryId}&language=sv-SE&page=1`);
      const data = await response.json();
      movies = data.results;
    }

    // Filtrera filmer baserat på sökord
    if (searchTerm) {
      movies = movies.filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    displayMovies(movies); // Visa filmer i gränssnittet
    displayChart(movies, category); // Visa stapeldiagram för filmer
  } catch (error) {
    console.error('Fel vid hämtning av filmer:', error);
  }
}

// Generera stjärnorna för betygen
function getStars(rating) {
  const fullStars = Math.floor(rating / 2);  // Konvertera betyg (1-10) till stjärnor (1-5)
  const emptyStars = 5 - fullStars; 

  let starsHTML = '';

  // Lägg till fyllda stjärnor
  for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span style="color: yellow;">★</span>';  
  }

  // Lägg till tomma stjärnor
  for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span style="color: white;">☆</span>';  
  }

  return starsHTML;
}

// Visa filmer i gränssnittet
function displayMovies(movies) {
  moviesGrid.innerHTML = ''; // Clear previous content
  const displayedMovieIds = new Set(); // Track displayed movie IDs

  movies.forEach((movie) => {
    if (displayedMovieIds.has(movie.id)) {
      return; // Skip duplicates
    }

    displayedMovieIds.add(movie.id); // Add movie ID to the set

    // Create the movie card
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const movieImage = document.createElement('img');
    movieImage.src = `${IMG_URL}${movie.poster_path}`;
    movieImage.alt = `${movie.title}`;

    imageContainer.appendChild(movieImage);
    movieCard.appendChild(imageContainer);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    // Fetch detailed movie data for genres
    fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`)
      .then((response) => response.json())
      .then((data) => {
        const genres = data.genres.map((genre) => genre.name).join(', ');

        overlay.innerHTML = `
          <h3 style="cursor: pointer;">${movie.title}</h3>
          <p><strong>Betyg:</strong> ${getStars(movie.vote_average)}</p>
          <p><strong>Genres:</strong> ${genres || 'N/A'}</p>
          <p><strong>Releasedatum:</strong> ${movie.release_date || 'Ej tillgänglig'}</p>
        `;

        // Add event listeners to navigate to details
        overlay.querySelector('h3').onclick = () => {
          window.location.href = `details.html?movie_id=${movie.id}`;
        };
        movieImage.onclick = () => {
          window.location.href = `details.html?movie_id=${movie.id}`;
        };
      })
      .catch((error) => {
        console.error('Error fetching movie details:', error);
        overlay.innerHTML = `
          <h3 style="cursor: pointer;">${movie.title}</h3>
          <p><strong>Betyg:</strong> ${getStars(movie.vote_average)}</p>
          <p><strong>Genres:</strong> N/A</p>
          <p><strong>Releasedatum:</strong> ${movie.release_date || 'Ej tillgänglig'}</p>
        `;
      });

    imageContainer.appendChild(overlay);

    // Add favorite button
    const addButton = document.createElement('button');
    addButton.textContent = 'Lägg till favoriter';
    addButton.classList.add('add-favorite-btn');
    addButton.onclick = function () {
      addMovieToFavorites(movie.id, movie.title, `${IMG_URL}${movie.poster_path}`, movie.vote_average);
    };

    movieCard.appendChild(addButton);
    moviesGrid.appendChild(movieCard);
  });
}


// Function to get genre names from genre IDs
function getGenreNames(genreIds) {
  if (!genreIds || genreIds.length === 0) return [];

  return genreIds
    .map((id) => CATEGORIES[id]) // Map genre IDs to names using the CATEGORIES object
    .filter(Boolean); // Remove undefined values
}

// Visa ett stapeldiagram för filmer
function displayChart(movies, category) {
    const chartLabels = movies.map((movie) => movie.title); // Filmens titlar
    const chartData = movies.map((movie) => movie.vote_average); // Filmens betyg

    const ctx = document.getElementById('movies-chart').getContext('2d');

    // Förstör tidigare diagram om det finns
    if (window.movieChart) {
        window.movieChart.destroy();
    }

    // Skapa ett nytt stapeldiagram
    window.movieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: `${category.charAt(0).toUpperCase() + category.slice(1)} Filmer`,
                data: chartData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Lägg till filmer i favoriter
function addMovieToFavorites(id, title, poster, rating) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const movie = { id, title, poster, rating };

  if (!favorites.some(fav => fav.id === id)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}


// Uppdatera filmens betyg
function updateMovieRating(id, newRating) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const movie = favorites.find(fav => fav.id === id);
  if (movie) {
    movie.rating = newRating;
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites(); 
  }
}

function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  console.log("Favorites:", favorites);
}

function addMovieToFavorites(id, title, poster, rating) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const movie = { id, title, poster, rating };

  if (!favorites.some(fav => fav.id === id)) {
    favorites.push(movie);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    showToast(`"${title}" has been added to your favorites.`);
  } else {
    showToast(`"${title}" is already in your favorites.`);
  }
}


function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; // Set the message
  toast.classList.add("show"); // Add the show class to make it visible

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}



// Kör vid sidladdning
document.addEventListener('DOMContentLoaded', () => {
  fetchMovies('all'); 
  displayFavorites();  
});

