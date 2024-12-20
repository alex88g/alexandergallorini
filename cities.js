const apiUrl = 'https://avancera.app/cities/'; // URL för API:et för städer
const cityList = document.getElementById('city-list'); // Elementet där stadens lista visas
const toast = document.getElementById('toast'); // Elementet för toast-meddelanden

// Visar ett toast meddelande
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Hämtar städer från API och rendera dem
function fetchCities() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(cities => renderCities(cities))
        .catch(error => console.error('Error fetching cities:', error));
}

// Renderar stadens lista i DOM
function renderCities(cities) {
    cityList.innerHTML = '';
    cities.forEach(city => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="city-info">
                <span>${city.name} (Population: ${city.population})</span>
                <input type="text" class="edit-name" placeholder="Edit Name" value="${city.name}">
                <input type="number" class="edit-population" placeholder="Edit Population" value="${city.population}">
                <button class="update-city" data-id="${city.id}">Update</button>
                <button class="delete-city" data-id="${city.id}">Delete</button>
            </div>
        `;
        cityList.appendChild(listItem);
    });

   // Lägger till event listeners för uppdaterings och raderingsknappar
    document.querySelectorAll('.update-city').forEach(button => {
        button.addEventListener('click', updateCity);
    });
    document.querySelectorAll('.delete-city').forEach(button => {
        button.addEventListener('click', deleteCity);
    });
}

// Lägger till en ny stad
document.getElementById('add-city-button').addEventListener('click', () => {
    const name = document.getElementById('new-city-name').value.trim();
    const population = parseInt(document.getElementById('new-city-population').value.trim());

    if (!name || !population || population < 0) {
        showToast('Invalid input for new city.');
        return;
    }

    fetch(apiUrl, {
        method: 'POST', // Använder POST för att skapa ny stad
        headers: { 'Content-Type': 'application/json' }, // Ställer in innehållstyp
        body: JSON.stringify({ name, population }), // Skickar data som JSON
    })
        .then(response => {
            if (response.ok) {
                showToast('Stad tillagd!'); // Visar framgångsmeddelande
                fetchCities(); // Uppdaterar stadens lista
            } else {
                showToast('Misslyckades att lägga till stad.'); 
            }
        })
        .catch(error => console.error('Fel vid tillägg av stad:', error));
});

// Uppdaterar en befintlig stad
function updateCity(event) {
    const id = event.target.dataset.id; // Hämta stadens ID
    const name = event.target.previousElementSibling.previousElementSibling.value.trim(); 
    const population = parseInt(event.target.previousElementSibling.value.trim()); // Ny population

    if (!name || !population || population < 0) { // Validerar inmatning
        showToast('Invalid input for city update.');
        return;
    }

    fetch(`${apiUrl}${id}`, {
        method: 'PUT', // Använder PUT för att uppdatera stad
        headers: { 'Content-Type': 'application/json' }, // Ställer in innehållstyp
        body: JSON.stringify({ id, name, population }), // Skickar uppdaterade data
    })
        .then(response => {
            if (response.ok) {
                showToast('Stad uppdaterad!'); // Visar framgångsmeddelande
                fetchCities(); // Uppdatera stadens lista
            } else {
                showToast('Misslyckades att uppdatera stad.');
            }
        })
        .catch(error => console.error('Error updating city:', error)); // Hanterar fel
}

// Raderar en stad
function deleteCity(event) {
    const id = event.target.dataset.id; // Hämta stadens ID

    fetch(`${apiUrl}${id}`, { method: 'DELETE' }) // Använder DELETE för att radera stad
        .then(response => {
            if (response.ok) {
                showToast('Stad raderad!'); // Visar framgångsmeddelande
                fetchCities(); // Uppdatera stadens lista
            } else {
                showToast('Misslyckades att radera stad.'); 
            }
        })
        .catch(error => console.error('Error deleting city:', error)); // Hanterar error fel
}

// Initial fetch
fetchCities();
