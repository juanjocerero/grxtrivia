// =================================================================================
// Elementos del DOM y Constantes Globales
// =================================================================================
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreEl = document.getElementById('score');
const cardCounterEl = document.getElementById('card-counter');
const nextCardContainer = document.getElementById('next-card-container');
const timeline = document.getElementById('timeline');
const finalScoreEl = document.getElementById('final-score');
const correctAnswersEl = document.getElementById('correct-answers');
const wrongAnswersEl = document.getElementById('wrong-answers');
const resumeModal = document.getElementById('resume-modal');
const resumeYesButton = document.getElementById('resume-yes-button');
const resumeNoButton = document.getElementById('resume-no-button');
const resultsModal = document.getElementById('results-modal');
const finalScoreModalEl = document.getElementById('final-score-modal');
const correctAnswersModalEl = document.getElementById('correct-answers-modal');
const wrongAnswersModalEl = document.getElementById('wrong-answers-modal');
const closeResultsModalButton = document.getElementById('close-results-modal');
const playAgainButton = document.getElementById('play-again-button');

const STORAGE_KEY = 'triviaGameState';

// =================================================================================
// Estado del Juego
// =================================================================================
let allEvents = []; // Contiene todos los eventos cargados de events.json
let gameEvents = []; // Contiene los 10 eventos seleccionados para la partida actual
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentCardIndex = 0;
let streak = 0; // Racha de aciertos consecutivos
let sortableTimeline, sortableNextCard; // Instancias de Sortable.js

// =================================================================================
// Carga de Datos
// =================================================================================

/**
* Carga los eventos históricos desde el archivo events.json.
*/
async function loadEvents() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allEvents = await response.json();
  } catch (error) {
    console.error('No se pudieron cargar los eventos:', error);
  }
}

/**
* Se asegura de que el DOM está completamente hidratado y es interactuable
* antes de iniciar la carga de datos y el renderizado de componentes
* @param {*} fn - La función a ejecutar
*/
function onDOMReady(fn) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
}

// =================================================================================
// Gestión de Estado (LocalStorage)
// =================================================================================

/**
* Guarda el estado actual de la partida en localStorage.
*/
function saveGameState() {
  const placedCards = Array.from(timeline.children).map(card => ({
    id: parseInt(card.dataset.id, 10),
    isCorrect: card.classList.contains('correct'),
    isIncorrect: card.classList.contains('incorrect')
  }));
  
  const state = {
    score, correctAnswers, wrongAnswers, currentCardIndex, gameEvents, placedCards, streak
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
* Limpia el estado de la partida de localStorage.
*/
function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
* Restaura el juego a partir de un estado guardado.
* @param {object} state - El objeto de estado parseado desde localStorage.
*/
function resumeGame(state) {
  score = state.score;
  correctAnswers = state.correctAnswers;
  wrongAnswers = state.wrongAnswers;
  currentCardIndex = state.currentCardIndex;
  gameEvents = state.gameEvents;
  streak = state.streak || 0;
  
  timeline.innerHTML = '';
  state.placedCards.forEach(cardState => {
    const event = allEvents.find(e => e.id === cardState.id);
    if (event) {
      const isResolved = cardState.isCorrect || cardState.isIncorrect ? { correct: cardState.isCorrect } : null;
      renderPlacedCard(event, isResolved);
    }
  });
  
  updateTimelineDensity();
  updateScore(0);
  updateCardCounter();
  renderNextCard();
  
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

// =================================================================================
// Lógica Principal de la Partida
// =================================================================================

/**
* Selecciona 11 eventos aleatorios sin años duplicados para una nueva partida.
*/
function prepareNewGame() {
  clearGameState();
  const eventsByYear = new Map();
  allEvents.forEach(event => {
    if (!eventsByYear.has(event.year)) eventsByYear.set(event.year, []);
    eventsByYear.get(event.year).push(event);
  });
  
  const uniqueYears = Array.from(eventsByYear.keys());
  const shuffledYears = uniqueYears.sort(() => 0.5 - Math.random());
  const selectedYears = shuffledYears.slice(0, 11);
  
  gameEvents = selectedYears.map(year => {
    const events = eventsByYear.get(year);
    return events[Math.floor(Math.random() * events.length)];
  });
}

/**
* Inicia una nueva partida desde cero.
*/
function startGame() {
  prepareNewGame();
  score = 0;
  correctAnswers = 0;
  wrongAnswers = 0;
  currentCardIndex = 0;
  streak = 0;
  timeline.innerHTML = '';
  nextCardContainer.innerHTML = '';
  
  sortableTimeline.option("disabled", false);
  sortableNextCard.option("disabled", false);
  
  // Saca una carta aleatoria de las 11 para que sea la inicial
  const firstCardIndex = Math.floor(Math.random() * gameEvents.length);
  const firstCard = gameEvents.splice(firstCardIndex, 1)[0];
  
  updateScore(0);
  updateCardCounter();
  renderPlacedCard(firstCard, null, true); // La carta inicial es el ancla y no está resuelta
  updateTimelineDensity();
  renderNextCard();
  
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
}

/**
* Finaliza la partida y muestra la pantalla de resultados.
*/
function endGame() {
  clearGameState();
  finalScoreModalEl.textContent = score;
  correctAnswersModalEl.textContent = correctAnswers;
  wrongAnswersModalEl.textContent = wrongAnswers;
  
  resultsModal.classList.remove('hidden');
  gameScreen.classList.add('hidden');
  
  // Expandir todas las tarjetas para que se pueda leer el texto completo
  timeline.classList.remove('dense-view', 'very-dense-view');
  Array.from(timeline.children).forEach(card => {
    const cardContent = card.querySelector('.card-content');
    if (cardContent) {
      cardContent.classList.remove('card-blur');
      cardContent.querySelector('p').style.display = 'block'; // Mostrar descripción
      const img = cardContent.querySelector('img');
      if (img) img.style.display = 'block'; // Mostrar imagen
    }
  });

  closeResultsModalButton.onclick = () => {
    resultsModal.classList.add('hidden');
    // Optionally, go back to start screen or keep game screen visible
    startScreen.classList.remove('hidden');
  };

  playAgainButton.onclick = () => {
    resultsModal.classList.add('hidden');
    startGame();
  };
}

// =================================================================================
// Lógica de Drag & Drop (Sortable.js)
// =================================================================================

/**
* Inicializa las instancias de Sortable.js para el drag and drop.
*/
function initDragAndDrop() {
  sortableTimeline = new Sortable(timeline, {
    group: { name: 'timeline-game', pull: false, put: true },
    sort: true, // Permitir reordenar las cartas no confirmadas
    filter: '.correct, .incorrect, .anchor-card', // No permitir mover cartas resueltas o la ancla
    animation: 150,
    ghostClass: 'card-ghost',
    onAdd: handleCardDrop
  });
  
  sortableNextCard = new Sortable(nextCardContainer, {
    group: { name: 'timeline-game', pull: true, put: false },
    animation: 150,
    ghostClass: 'card-ghost'
  });
}

/**
* Se ejecuta cuando una carta se suelta en la línea de tiempo.
* @param {Event} evt - El evento de Sortable.js.
*/
function handleCardDrop(evt) {
  const droppedCard = evt.item;
  droppedCard.classList.add('card-in-timeline'); // Añadir clase para la línea de tiempo
  const cardContent = droppedCard.querySelector('.card-content');
  
  // Evitar añadir un overlay si ya existe
  if (droppedCard.querySelector('.confirm-overlay')) return;
  
  // Aplicar desenfoque al contenido
  if (cardContent) {
    cardContent.classList.add('card-blur');
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'Confirmar';
  confirmButton.className = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg';
  
  overlay.appendChild(confirmButton);
  droppedCard.appendChild(overlay);
  
  confirmButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const timelineCards = Array.from(timeline.children);
    const currentIndex = timelineCards.indexOf(droppedCard);
    confirmPlacement(droppedCard, currentIndex);
  }, { once: true });
}

/**
* Ajusta la densidad visual del timeline aplicando clases CSS.
*/
function updateTimelineDensity() {
  const cardCount = timeline.children.length;
  timeline.classList.remove('dense-view', 'very-dense-view');
  
  if (cardCount >= 8) { // Very Dense
    timeline.classList.add('very-dense-view');
  } else if (cardCount >= 5) { // Dense
    timeline.classList.add('dense-view');
  }
}

/**
* Valida la posición de la carta, actualiza el estado y avanza el juego.
* @param {HTMLElement} card - El elemento de la carta a confirmar.
* @param {number} newIndex - La nueva posición de la carta en la línea de tiempo.
*/
function confirmPlacement(card, newIndex) {
  // Eliminar overlay y desenfoque
  card.querySelector('.confirm-overlay').remove();
  const cardContent = card.querySelector('.card-content');
  if (cardContent) {
    cardContent.classList.remove('card-blur');
  }
  
  // Deshabilitar drag & drop durante la validación
  sortableTimeline.option("disabled", true);
  sortableNextCard.option("disabled", true);
  
  // Eliminar la marca de ancla si existiera
  const anchor = timeline.querySelector('.anchor-card');
  if (anchor) {
    anchor.classList.remove('anchor-card');
  }
  
  const cardYear = parseInt(card.dataset.year, 10);
  const timelineCards = Array.from(timeline.children);
  const prevCard = timelineCards[newIndex - 1];
  const nextCard = timelineCards[newIndex + 1];
  
  const prevYear = prevCard ? parseInt(prevCard.dataset.year, 10) : -Infinity;
  const nextYear = nextCard ? parseInt(nextCard.dataset.year, 10) : Infinity;
  
  const isCorrect = cardYear > prevYear && cardYear < nextYear;
  
  const yearBadge = card.querySelector('.year-badge');
  yearBadge.classList.remove('hidden');
  
  if (isCorrect) {
    streak++;
    const points = 1 + streak; // Puntuación base + bonus por racha
    card.classList.add('correct');
    updateScore(points);
    correctAnswers++;
  } else {
    streak = 0; // Reiniciar racha
    card.classList.add('incorrect');
    wrongAnswers++;
  }
  
  updateTimelineDensity();
  
  currentCardIndex++;
  
  if (currentCardIndex >= gameEvents.length) {
    setTimeout(endGame, 1200); // Pequeña espera para ver el resultado final
  } else {
    saveGameState();
    updateCardCounter();
    renderNextCard();
    // Reactivar drag and drop para la siguiente jugada
    sortableTimeline.option("disabled", false);
    sortableNextCard.option("disabled", false);
  }
}

// =================================================================================
// Funciones de Renderizado en el DOM
// =================================================================================

function renderCard(event, isDraggable) {
  const card = document.createElement('div');
  card.dataset.id = event.id;
  card.dataset.year = event.year;
  card.className = 'card bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto relative';
  card.classList.toggle('cursor-move', isDraggable);
  
  let imageHTML = '';
  if (event.image) {
    imageHTML = `<img src="${event.image}" alt="${event.title}" class="w-full h-32 object-cover my-2 rounded">`;
  }
  
  card.innerHTML = `
        <div class="card-content">
            <h3 class="font-bold text-lg text-gray-900">${event.title}</h3>
            <p class="text-gray-700 text-sm">${event.description}</p>
            ${imageHTML}
            <div class="year-badge hidden absolute top-2 right-2 bg-gray-200 text-xs font-bold px-2 py-1 rounded text-gray-800">${event.isApproximate ? 'Circa' : ''} ${event.year}</div>
        </div>
    `;
  return card;
}

function renderPlacedCard(event, isResolved, isInitial = false) {
  const card = renderCard(event, false);
  card.classList.add('card-in-timeline');
  
  if (isInitial) {
    card.classList.add('anchor-card');
    card.querySelector('.year-badge').classList.remove('hidden');
  } else if (isResolved) {
    card.querySelector('.year-badge').classList.remove('hidden');
    card.classList.add(isResolved.correct ? 'correct' : 'incorrect');
  }
  // La insignia del año en las cartas recién colocadas (no resueltas) permanece oculta por defecto.
  
  const timelineCards = [...timeline.children];
  const correctIndex = timelineCards.findIndex(c => parseInt(c.dataset.year, 10) > event.year);
  
  if (correctIndex === -1) {
    timeline.appendChild(card);
  } else {
    timeline.insertBefore(card, timelineCards[correctIndex]);
  }
}

function renderNextCard() {
  if (currentCardIndex < gameEvents.length) {
    const nextEvent = gameEvents[currentCardIndex];
    const card = renderCard(nextEvent, true);
    nextCardContainer.innerHTML = '';
    nextCardContainer.appendChild(card);
  } else {
    nextCardContainer.innerHTML = '<div class="text-center text-gray-500">¡No hay más cartas!</div>';
  }
}

function updateScore(points) {
  if (points !== 0) score += points;
  scoreEl.textContent = score;
}

function updateCardCounter() {
  cardCounterEl.textContent = `${currentCardIndex + 1}/${gameEvents.length}`;
}

// =================================================================================
// Inicialización de la Aplicación
onDOMReady(() => {
  loadEvents().then(() => {
    initDragAndDrop();
    
    const savedStateJSON = localStorage.getItem(STORAGE_KEY);
    if (savedStateJSON) {
      showResumeGameModal(JSON.parse(savedStateJSON));
    }
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
  });
});

function showResumeGameModal(savedState) {
  resumeModal.classList.remove('hidden');

  resumeYesButton.onclick = () => {
    resumeGame(savedState);
    resumeModal.classList.add('hidden');
  };

  resumeNoButton.onclick = () => {
    clearGameState();
    resumeModal.classList.add('hidden');
  };
}