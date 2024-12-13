document.addEventListener("DOMContentLoaded", () => {
  // API konfiguration för att hämta filmdata samt personliga API nyckeln
  const API_KEY = '34a3a84e40cb412a83d35dc3d683b406';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_URL = 'https://image.tmdb.org/t/p/original';

  // Hämta film ID från URL
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('movie_id');

  // Hämta element från DOM för att manipulera innehåll
  const bigCover = document.getElementById("bigCover");
  const moviePoster = document.getElementById("moviePoster");
  const movieInfo = document.getElementById("movieInfo");
  const trailerContainer = document.getElementById("trailerContainer");
  const commentForm = document.getElementById("commentForm");
  const commentInput = document.getElementById("commentInput");
  const commentsList = document.getElementById("commentsList");
  const toast = document.getElementById("toast");

  let rating = 0;
  let editingIndex = null;

 // Hämtar detaljer om filmen från API
  fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`)
    .then((response) => response.json())
    .then((data) => {
      // Lägger till information i filmsektion
      const genres = data.genres.map((genre) => genre.name).join(", ");
      bigCover.style.backgroundImage = `url(${IMG_URL}${data.backdrop_path})`;
      moviePoster.innerHTML = `<img src="${IMG_URL}${data.poster_path}" alt="Movie Poster">`;
      movieInfo.innerHTML = `
        <h2>${data.original_title}</h2>
        <p><strong>Overview:</strong> ${data.overview}</p>
        <p><strong>Release Date:</strong> ${data.release_date || "N/A"}</p>
        <p><strong>Rating:</strong> ${data.vote_average || "N/A"}</p>
        <p><strong>Genres:</strong> ${genres || "N/A"}</p>
      `;
    })
    .catch((error) => console.error("Error fetching movie details:", error));

  // Hämtar trailers för filmen
  fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`)
    .then((response) => response.json())
    .then((data) => {
      const trailers = data.results.filter(
        (video) => video.site === "YouTube" && video.type === "Trailer"
      );
      trailers.forEach((trailer) => {
        const trailerFrame = `<iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
        trailerContainer.innerHTML += trailerFrame;
      });
    });

  // Laddar kommentarer från localStorage
  const loadComments = () => {
    const savedComments = JSON.parse(localStorage.getItem(`comments_${movieId}`)) || [];
    commentsList.innerHTML = '';
    savedComments.forEach((comment, index) => {
      const commentElement = createCommentElement(comment, index);
      commentsList.appendChild(commentElement);
    });
  };

 // Skapar ett DOM element för en kommentar
  const createCommentElement = (comment, index) => {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = `
      <p><strong>Rating:</strong> ${comment.rating} stars</p>
      <p>${comment.text}</p>
      <button class="edit-comment" data-index="${index}">Edit</button>
      <button class="delete-comment" data-index="${index}">Delete</button>
    `;
    return commentDiv;
  };

   // Sparar en ny kommentar till localStorage
  const saveComment = (text, rating) => {
    const savedComments = JSON.parse(localStorage.getItem(`comments_${movieId}`)) || [];
    savedComments.push({ text, rating });
    localStorage.setItem(`comments_${movieId}`, JSON.stringify(savedComments));
  };

  // Uppdaterar en existerande kommentar
  const updateComment = (index, newText, newRating) => {
    const savedComments = JSON.parse(localStorage.getItem(`comments_${movieId}`)) || [];
    if (savedComments[index]) {
      savedComments[index] = { text: newText, rating: newRating };
      localStorage.setItem(`comments_${movieId}`, JSON.stringify(savedComments));
      loadComments();
      showToast("Comment updated successfully!");
    }
  };

   // Hanterar formulärinlämning för kommentarer
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const commentText = commentInput.value.trim();
    if (commentText && rating > 0) {
      if (editingIndex !== null) {
        // Uppdaterar kommentar
        updateComment(editingIndex, commentText, rating);
        editingIndex = null;
      } else {
        // Lägger till ny kommentar
        saveComment(commentText, rating);
      }
      loadComments();
      commentInput.value = "";
      document.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
      rating = 0;
      showToast("Comment saved successfully!");
    } else {
      showToast("Please enter a comment and rating.");
    }
  });

   // Hanterar radering och redigering av kommentarer
  commentsList.addEventListener("click", (e) => {
    const savedComments = JSON.parse(localStorage.getItem(`comments_${movieId}`)) || [];
    const index = e.target.dataset.index;

    if (e.target.classList.contains("delete-comment")) {
      savedComments.splice(index, 1);
      localStorage.setItem(`comments_${movieId}`, JSON.stringify(savedComments));
      loadComments();
      showToast("Comment deleted successfully!");
    }

    if (e.target.classList.contains("edit-comment")) {
      // Fyller formuläret med vald kommentar
      const commentToEdit = savedComments[index];
      commentInput.value = commentToEdit.text;
      rating = commentToEdit.rating;
      editingIndex = index; // Sätter index för redigering
      document.querySelectorAll(".star").forEach((s, i) => {
        s.classList.toggle("active", i < rating);
      });
    }
  });

  // Visar toast meddelanden
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000); // Försvinner efter 3 sekunder
  }

  // Hantera klick på stjärnbetyg
  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", function () {
      rating = this.dataset.rating;
      document.querySelectorAll(".star").forEach((s) => s.classList.remove("active"));
      for (let i = 0; i < rating; i++) {
        document.querySelectorAll(".star")[i].classList.add("active");
      }
    });
  });

  // Initierar laddning av kommentarer vid sidladdning
  loadComments();
});
