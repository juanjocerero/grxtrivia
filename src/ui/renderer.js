import { DOM } from './dom.js';

const _renderCard = (event, isDraggable = false) => {
  const card = document.createElement('div');
  card.dataset.id = event.id;
  card.dataset.year = event.year;
  card.className = 'card bg-white p-4 rounded-lg shadow-lg w-full max-w-lg mx-auto relative';
  
  if (isDraggable) card.classList.add('cursor-move');

  const imageHTML = event.image 
    ? `<img src="${event.image}" alt="${event.title}" class="w-20 h-20 object-cover rounded flex-shrink-0">` 
    : '';
  
  card.innerHTML = `
    <div class="card-content flex items-center gap-4">
      ${imageHTML}
      <div class="text-wrapper flex-grow">
        <h3 class="font-bold text-lg text-gray-900">${event.title}</h3>
        <p class="text-gray-700 text-sm">${event.description}</p>
      </div>
      <div class="year-badge hidden absolute bg-gray-200 text-xs font-bold px-2 py-1 rounded text-gray-800">${event.isApproximate ? 'Circa' : ''} ${event.year}</div>
    </div>
  `;
  return card;
};

const _updateTimelineDensity = (cardCount) => {
  DOM.timeline.classList.remove('dense-view', 'very-dense-view');
  if (cardCount >= 8) {
    DOM.timeline.classList.add('very-dense-view');
  } else if (cardCount >= 5) {
    DOM.timeline.classList.add('dense-view');
  }
};

export const render = (state) => {
  // Render Score & Counter
  DOM.scoreEl.textContent = state.score;
  if (state.gameEvents.length > 0) {
    const currentIndex = state.timelineEvents.length;
    DOM.cardCounterEl.textContent = `${currentIndex}/${state.gameEvents.length + 1}`;
  }

  // Render Timeline (Intelligent Update)
  const sortedTimeline = [...state.timelineEvents].sort((a, b) => a.year - b.year);
  const existingCardElements = new Map(
    Array.from(DOM.timeline.children).map(card => [card.dataset.id, card])
  );
  const processedCardIds = new Set();

  sortedTimeline.forEach(event => {
    const eventId = String(event.id);
    processedCardIds.add(eventId);
    let card = existingCardElements.get(eventId);

    if (!card) {
        card = _renderCard(event);
        card.classList.add('card-in-timeline');
    }

    // Update classes based on the event state
    if (event.isResolved) {
      card.querySelector('.year-badge').classList.remove('hidden');
      card.classList.toggle('correct', !event.isAnchor && event.isCorrect);
      card.classList.toggle('incorrect', !event.isAnchor && !event.isCorrect);
      card.classList.toggle('anchor-card', event.isAnchor);
    }
    
    // appendChild also moves the element, ensuring the correct order
    DOM.timeline.appendChild(card);
  });

  // Remove any cards from the DOM that are no longer in the state
  existingCardElements.forEach((card, id) => {
    if (!processedCardIds.has(id)) {
        card.remove();
    }
  });

  _updateTimelineDensity(state.timelineEvents.length);

  // Render Next Card
  DOM.nextCardContainer.innerHTML = '';
  if (state.nextCard) {
    const card = _renderCard(state.nextCard, true);
    DOM.nextCardContainer.appendChild(card);
  } else if (!state.isGameOver) {
    DOM.nextCardContainer.innerHTML = '<div class="text-center text-gray-500">¡No hay más cartas!</div>';
  }

  // Render Screens
  if (state.isGameOver) {
    DOM.gameScreen.classList.add('hidden');
    DOM.resultsModal.classList.remove('hidden');
    DOM.finalScoreModalEl.textContent = state.score;
    DOM.correctAnswersModalEl.textContent = state.correctAnswers;
    DOM.wrongAnswersModalEl.textContent = state.wrongAnswers;
  } else if (state.timelineEvents.length > 0) {
    DOM.startScreen.classList.add('hidden');
    DOM.gameScreen.classList.remove('hidden');
  } else {
    DOM.startScreen.classList.remove('hidden');
    DOM.gameScreen.classList.add('hidden');
  }
};
