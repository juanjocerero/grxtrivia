import { DOM } from './dom.js';
import confetti from 'canvas-confetti';

let previousState = {};

const _renderCard = (event, isDraggable = false) => {
  const card = document.createElement('div');
  card.dataset.id = event.id;
  card.dataset.year = event.year;
  card.className = 'card bg-white p-4 rounded-lg border border-gray-200 w-full max-w-lg mx-auto relative select-none';
  if (isDraggable) card.classList.add('shadow-lg');
  
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

const _checkAndApplyDensity = () => {
  // Si ya está en modo denso, no hacer nada más.
  if (DOM.timeline.classList.contains('very-dense-view')) {
    return;
  }

  const containerHeight = DOM.timelineWrapper.clientHeight;
  const contentHeight = DOM.timeline.scrollHeight;

  if (contentHeight > containerHeight) {
    DOM.timeline.classList.add('very-dense-view');
  }
};

const _showStreakPopup = (streak) => {
    if (streak < 2) return;
    const popup = document.createElement('div');
    popup.className = 'streak-popup';
    popup.textContent = `¡Racha x${streak}!`;
    DOM.timeline.parentNode.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1500); // Duración de la animación de salida + tiempo en pantalla
}

export const render = (state) => {
  // --- Render Score, Counter & Streak ---
  if (previousState.score !== state.score) {
    DOM.scoreEl.textContent = state.score;
    DOM.scoreEl.classList.add('animate-jump');
    setTimeout(() => DOM.scoreEl.classList.remove('animate-jump'), 300);
  }

  if (state.gameEvents.length > 0) {
    const currentIndex = state.timelineEvents.length;
    DOM.cardCounterEl.textContent = `${currentIndex}/${state.gameEvents.length}`;
  }

  if (previousState.streak !== state.streak) {
    if (state.streak > 1) {
        DOM.streakCounter.classList.remove('hidden');
        DOM.streakCounter.textContent = `🔥 Racha x${state.streak}`;
        DOM.streakCounter.classList.add('animate-flash');
        setTimeout(() => DOM.streakCounter.classList.remove('animate-flash'), 500);
        
        if(state.streak > previousState.streak) {
            _showStreakPopup(state.streak);
        }

    } else {
        DOM.streakCounter.classList.add('hidden');
    }
  }


  // --- Render Timeline (Intelligent Update) ---
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

        // Animar la aparición de la nueva tarjeta
        card.classList.add('card-entering');
        setTimeout(() => {
            card.classList.remove('card-entering');
        }, 400); // La duración de la animación
    }

    // Ensure card-in-timeline class is always present for cards in the timeline
    card.classList.add('card-in-timeline');
    card.classList.remove('shadow-lg');

    // Update classes based on the event state
    if (event.isResolved) {
      card.querySelector('.year-badge').classList.remove('hidden');
      card.classList.toggle('correct', !event.isAnchor && event.isCorrect);
      card.classList.toggle('incorrect', !event.isAnchor && !event.isCorrect);
      card.classList.toggle('anchor-card', event.isAnchor);
    }

    // Toggle expanded state
    card.classList.toggle('is-expanded', event.isExpanded);
    
    // appendChild also moves the element, ensuring the correct order
    DOM.timeline.appendChild(card);
  });

  // Remove any cards from the DOM that are no longer in the state
  existingCardElements.forEach((card, id) => {
    if (!processedCardIds.has(id)) {
        card.remove();
    }
  });

  _checkAndApplyDensity();

  // --- Render Next Card ---
  DOM.nextCardContainer.innerHTML = '';
  if (state.nextCard) {
    const card = _renderCard(state.nextCard, true);
    DOM.nextCardContainer.appendChild(card);
  } else if (!state.isGameOver) {
    DOM.nextCardContainer.innerHTML = '<div class="text-center text-gray-500">¡No hay más cartas!</div>';
  }

  // --- Render Screens ---
  if (state.isGameOver) {
    DOM.gameScreen.classList.add('hidden');
    DOM.resultsModal.classList.remove('hidden');
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
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

  // --- Update previous state for next render ---
  previousState = { ...state };
};
