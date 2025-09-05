import { DOM } from './dom.js';

const _renderCard = (event, isDraggable = false) => {
  const card = document.createElement('div');
  card.dataset.id = event.id;
  card.dataset.year = event.year;
  card.className = 'card bg-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto relative';
  
  if (isDraggable) card.classList.add('cursor-move');

  let imageHTML = event.image ? `<img src="${event.image}" alt="${event.title}" class="w-full h-32 object-cover my-2 rounded">` : '';
  
  card.innerHTML = `
    <div class="card-content">
      <h3 class="font-bold text-lg text-gray-900">${event.title}</h3>
      <p class="text-gray-700 text-sm">${event.description}</p>
      ${imageHTML}
      <div class="year-badge hidden absolute top-2 right-2 bg-gray-200 text-xs font-bold px-2 py-1 rounded text-gray-800">${event.isApproximate ? 'Circa' : ''} ${event.year}</div>
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

  // Render Score & Counter
  DOM.scoreEl.textContent = state.score;
  if (state.gameEvents.length > 0) {
    const currentIndex = state.timelineEvents.length;
    DOM.cardCounterEl.textContent = `${currentIndex}/${state.gameEvents.length + 1}`;
  }

  // Render Timeline
  DOM.timeline.innerHTML = '';
  const sortedTimeline = [...state.timelineEvents].sort((a, b) => a.year - b.year);
  sortedTimeline.forEach(event => {
    const card = _renderCard(event);
    card.classList.add('card-in-timeline');
    if (event.isResolved) {
      card.querySelector('.year-badge').classList.remove('hidden');
      if (!event.isAnchor) {
        card.classList.add(event.isCorrect ? 'correct' : 'incorrect');
      } else {
        card.classList.add('anchor-card');
      }
    }
    DOM.timeline.appendChild(card);
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
};
