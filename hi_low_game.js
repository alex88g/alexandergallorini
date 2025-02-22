// Hämtar HTML-element
const player1CardEl = document.getElementById('player1Card');
const player2CardEl = document.getElementById('player2Card');
const messageEl = document.getElementById('message');
const scoreEl = document.getElementById('score');
const nextTurnButton = document.getElementById('nextTurn');
const beerEl = document.getElementById('beer');

// Initierar spelvariabler
let currentCardPlayer1 = drawCard();
let currentCardPlayer2 = drawCard();
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let currentPlayer = 1;
const usedCards = new Set(); // För att hålla reda på använda kort

// Kortsbilder kopplade till kortens värde
const cardImages = {
    1: 'images/cards/Ace of Hearts.jpg',
    2: 'images/cards/Two of Hearts.jpg',
    3: 'images/cards/Three of Hearts.jpg',
    4: 'images/cards/Four of Hearts.jpg',
    5: 'images/cards/Five of Hearts.jpg',
    6: 'images/cards/Six of Hearts.jpg',
    7: 'images/cards/Seven of Hearts.jpg',
    8: 'images/cards/Eight of Hearts.jpg',
    9: 'images/cards/Nine of Hearts.jpg',
    10: 'images/cards/Ten of Hearts.jpg',
    11: 'images/cards/Jack of Hearts.jpg',
    12: 'images/cards/Queen of Hearts.jpg',
    13: 'images/cards/King of Hearts.jpg',
    14: 'images/cards/Ace of Spades.jpg',
    15: 'images/cards/Two of Spades.jpg',
    16: 'images/cards/Three of Spades.jpg',
    17: 'images/cards/Four of Spades.jpg',
    18: 'images/cards/Five of Spades.jpg',
    19: 'images/cards/Six of Spades.jpg',
    20: 'images/cards/Seven of Spades.jpg',
    21: 'images/cards/Eight of Spades.jpg',
    22: 'images/cards/Nine of Spades.jpg',
    23: 'images/cards/Ten of Spades.jpg',
    24: 'images/cards/Jack of Spades.jpg',
    25: 'images/cards/Queen of Spades.jpg',
    26: 'images/cards/King of Spades.jpg',
    27: 'images/cards/Ace of Diamonds.jpg',
    28: 'images/cards/Two of Diamonds.jpg',
    29: 'images/cards/Three of Diamonds.jpg',
    30: 'images/cards/Four of Diamonds.jpg',
    31: 'images/cards/Five of Diamonds.jpg',
    32: 'images/cards/Six of Diamonds.jpg',
    33: 'images/cards/Seven of Diamonds.jpg',
    34: 'images/cards/Eight of Diamonds.jpg',
    35: 'images/cards/Nine of Diamonds.jpg',
    36: 'images/cards/Ten of Diamonds.jpg',
    37: 'images/cards/Jack of Diamonds.jpg',
    38: 'images/cards/Queen of Diamonds.jpg',
    39: 'images/cards/King of Diamonds.jpg',
    40: 'images/cards/Ace of Clubs.jpg',
    41: 'images/cards/Two of Clubs.jpg',
    42: 'images/cards/Three of Clubs.jpg',
    43: 'images/cards/Four of Clubs.jpg',
    44: 'images/cards/Five of Clubs.jpg',
    45: 'images/cards/Six of Clubs.jpg',
    46: 'images/cards/Seven of Clubs.jpg',
    47: 'images/cards/Eight of Clubs.jpg',
    48: 'images/cards/Nine of Clubs.jpg',
    49: 'images/cards/Ten of Clubs.jpg',
    50: 'images/cards/Jack of Clubs.jpg',
    51: 'images/cards/Queen of Clubs.jpg',
    52: 'images/cards/King of Clubs.jpg',
};

// Slumpar ett kort
function drawCard() {
    return Math.floor(Math.random() * 52) + 1;
}

// Ställer in kortets baksida
function initializeCardCover(cardElement) {
    const back = cardElement.querySelector('.back');
    back.style.backgroundImage = `url('images/cards/Card Back.jpg')`;
    cardElement.classList.remove('flip');
}

// Uppdaterar kortets framsida
function updateCardDisplay(cardElement, cardValue) {
    const front = cardElement.querySelector('.front');
    front.style.backgroundImage = `url('${cardImages[cardValue]}')`;
    cardElement.classList.add('flip');
}

// Nästa spelomgång
function nextTurn() {
    const newCard = drawCard(); // Dra ett nytt kort

    if (currentPlayer === 1) {
        // Spelare 1:s tur
        flipCard(player1CardEl, newCard, () => {
            if (newCard > currentCardPlayer1) {
                // Spelare 1 vinner rundan
                scorePlayer1++;
                showMessage('Spelare 1 drog ett högre kort och vinner rundan!', true);
            } else if (newCard < currentCardPlayer1) {
                // Spelare 1 förlorar rundan
                showMessage('Spelare 1 drog ett lägre kort och förlorar rundan! Ta en klunk öl!', false);
                displayBeer(); // Visa öl för förloraren
            } else {
                // Lika kort
                showMessage('Spelare 1 drog samma kort! Ingen poäng delas ut.', false, true);
            }
            currentCardPlayer1 = newCard; // Uppdatera aktuellt kort
            updateGameState(); // Byt till nästa spelare
        });
    } else {
        // Spelare 2:s tur
        flipCard(player2CardEl, newCard, () => {
            if (newCard > currentCardPlayer2) {
                // Spelare 2 vinner rundan
                scorePlayer2++;
                showMessage('Spelare 2 drog ett högre kort och vinner rundan!', true);
            } else if (newCard < currentCardPlayer2) {
                // Spelare 2 förlorar rundan
                showMessage('Spelare 2 drog ett lägre kort och förlorar rundan! Ta en klunk öl!', false);
                displayBeer(); // Visa öl för förloraren
            } else {
                // Lika kort
                showMessage('Spelare 2 drog samma kort! Ingen poäng delas ut.', false, true);
            }
            currentCardPlayer2 = newCard; // Uppdatera aktuellt kort
            updateGameState(); // Byt till nästa spelare
        });
    }
}

// här visar vi toast meddelande
function showMessage(message, isWin, isDraw = false) {
    messageEl.textContent = message;

    if (isDraw) {
        // Neutral färg för lika
        messageEl.style.color = '#808080';
        messageEl.style.backgroundColor = '#F5F5F5';
        messageEl.style.border = '2px solid #808080';
    } else if (isWin) {
        // Grön färg för vinst
        messageEl.style.color = '#2F7C60';
        messageEl.style.backgroundColor = '#E0F7E9';
        messageEl.style.border = '2px solid #2F7C60';
    } else {
        // Röd färg för förlust
        messageEl.style.color = '#A73A2C';
        messageEl.style.backgroundColor = '#FDE2E1';
        messageEl.style.border = '2px solid #A73A2C';
    }

    messageEl.style.padding = '10px';
    messageEl.style.borderRadius = '5px';
}


// Flippar kortet med callback
function flipCard(cardElement, cardValue, callback) {
    const front = cardElement.querySelector('.front');
    const back = cardElement.querySelector('.back');
    front.style.backgroundImage = `url('${cardImages[cardValue]}')`;
    cardElement.classList.add('flip'); // Visar kortets framsida

    setTimeout(() => {
        cardElement.classList.remove('flip'); // Döljer kortet efter animationen
        back.style.backgroundImage = `url('images/cards/Card Back.jpg')`;
        if (callback) callback(); // Kör callback efter animationen
    }, 500); // Vänta på att animationen ska slutföras
}



// Uppdaterar spelets status
function updateGameState() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    scoreEl.textContent = `Score Player 1: ${scorePlayer1} | Score Player 2: ${scorePlayer2}`;
    messageEl.textContent += ` Now it's Player ${currentPlayer}'s turn!`;
}

// Visar ölflaskor för förloraren
function displayBeer() {
    beerEl.innerHTML = '';
    const beerImg = document.createElement('img');
    beerImg.src = 'images/beer.gif'; // Söker efter GIF
    beerImg.alt = 'Beer';
    beerImg.style.width = '100px'; // Valfritt Justera storlek
    beerEl.appendChild(beerImg);

    // Tar bort ölbilden efter 3 sekunder
    setTimeout(() => {
        beerEl.innerHTML = '';
    }, 3000);
}



// Visa ölflaskor för förloraren
function displayBeer() {
    beerEl.innerHTML = '';
    for (let i = 0; i < 1; i++) {
        const beerImg = document.createElement('img');
        beerImg.src = 'images/beer.gif';
        beerImg.alt = 'Beer';
        beerEl.appendChild(beerImg);

        // Ta bort öl GIF efter 3 sekunder
    setTimeout(() => {
        beerEl.innerHTML = ''; // Rensar innehållet i öl elementet
    }, 3000); // Väntar i 3000 millisekunder (3 sekunder)
    }
}

// Event Listeners
nextTurnButton.addEventListener('click', nextTurn);

// Initiera spelet
initializeCardCover(player1CardEl);
initializeCardCover(player2CardEl);
