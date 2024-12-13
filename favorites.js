// API konfiguration för att hämta filmdata samt personliga API nyckeln
const API_KEY = '34a3a84e40cb412a83d35dc3d683b406';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Hämta favoriter från localStorage eller returnera en tom array om inga finns
function getFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return favorites;
}

// Generera stjärnor baserat på filmens betyg
function getStars(rating) {
  const fullStars = Math.floor(rating / 2); // Konvertera betyg (av 10) till stjärnor (av 5)
  const emptyStars = 5 - fullStars;

  let starsHTML = '';

  // Lägg till fyllda stjärnor
  for (let i = 0; i < fullStars; i++) {
      starsHTML += '<span style="color: yellow;">★</span>';
  }

  // Lägg till tomma stjärnor
  for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<span style="color: gray;">☆</span>';
  }

  return starsHTML;
}

// Visa listan med favoritfilmer
function displayFavorites() {
  const favorites = getFavorites(); // Hämta favoriter från localStorage
  const favoritesContainer = document.querySelector('.favorites-container');
  favoritesContainer.innerHTML = ''; // Töm containern

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = '<p>Du har inga favoriter ännu.</p>';
    return;
  }

  favorites.forEach((movie) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('favorites-card');

    // Skapa en bildcontainer
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    const movieImage = document.createElement('img');
    movieImage.src = `${IMG_URL}${movie.poster}`;
    movieImage.alt = `${movie.title}`;
    imageContainer.appendChild(movieImage);

    // Hämta filmdetaljer för genrer och utgivningsdatum
    fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=sv-SE`)
      .then((response) => response.json())
      .then((data) => {
        const genres = data.genres.map((genre) => genre.name).join(', ');

        // Skapa en overlay för att visa titel, betyg, genrer och releasedatum
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.innerHTML = `
          <h3 style="cursor: pointer;">${movie.title}</h3>
          <p><strong>Betyg:</strong> ${getStars(movie.rating)}</p>
          <p><strong>Genres:</strong> ${genres || 'N/A'}</p>
          <p><strong>Releasedatum:</strong> ${data.release_date || 'Ej tillgänglig'}</p>
        `;

        overlay.querySelector('h3').onclick = () => {
          window.location.href = `details.html?movie_id=${movie.id}`;
        };

        imageContainer.appendChild(overlay);
      })
      .catch((error) => {
        console.error('Error fetching movie details:', error);

        // Skapa standard overlay vid fel
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.innerHTML = `
          <h3 style="cursor: pointer;">${movie.title}</h3>
          <p><strong>Betyg:</strong> ${getStars(movie.rating)}</p>
          <p><strong>Genres:</strong> N/A</p>
          <p><strong>Releasedatum:</strong> Ej tillgänglig</p>
        `;
        imageContainer.appendChild(overlay);
      });

    // Skapa en knapp för att ta bort filmen från favoriter
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Ta bort från favoriter';
    removeButton.classList.add('remove-favorite-btn');
    removeButton.onclick = function () {
      removeMovieFromFavorites(movie.id);
    };

    movieCard.appendChild(imageContainer);
    movieCard.appendChild(removeButton);
    favoritesContainer.appendChild(movieCard);
  });

  // Visa donut diagrammet för favoriter
  displayFavoritesDonutChart(favorites);
}

// Ta bort en film från favoriter
function removeMovieFromFavorites(id) {
  let favorites = getFavorites();
  favorites = favorites.filter((movie) => movie.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
}

// Visa ett donut diagram över betyg för favoritfilmer
function displayFavoritesDonutChart(favorites) {
  const ratings = favorites.map((movie) => movie.rating);
  const ratingCounts = [0, 0, 0];

  ratings.forEach((rating) => {
    if (rating <= 3) {
      ratingCounts[0]++;
    } else if (rating <= 6) {
      ratingCounts[1]++;
    } else {
      ratingCounts[2]++;
    }
  });

  const chartData = {
    labels: ['0-3 Betyg', '4-6 Betyg', '7-10 Betyg'],
    datasets: [
      {
        data: ratingCounts,
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const ctx = document.getElementById('favorites-donut-chart').getContext('2d');
  if (window.favoritesDonutChart) {
    window.favoritesDonutChart.destroy();
  }

  window.favoritesDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  });
}

// Initiera visningen av favoriter vid sidladdning
document.addEventListener('DOMContentLoaded', displayFavorites);