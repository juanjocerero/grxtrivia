import { STATE, STORAGE_KEY } from './state.js';

export const createGameManager = (allEvents) => {
  STATE.allEvents = allEvents;

  // Notifica a la UI cuando el estado cambia
  let onStateChangeCallback = () => {};

  const notify = () => onStateChangeCallback(STATE);

  const _prepareNewGame = () => {
    const eventsByYear = new Map();
    STATE.allEvents.forEach(event => {
      if (!eventsByYear.has(event.year)) eventsByYear.set(event.year, []);
      eventsByYear.get(event.year).push(event);
    });

    const uniqueYears = Array.from(eventsByYear.keys());
    const shuffledYears = uniqueYears.sort(() => 0.5 - Math.random());
    const selectedYears = shuffledYears.slice(0, 11);

    STATE.gameEvents = selectedYears.map(year => {
      const events = eventsByYear.get(year);
      return events[Math.floor(Math.random() * events.length)];
    });
  };

  const startGame = () => {
    _prepareNewGame();
    
    // Reset state
    Object.assign(STATE, {
      timelineEvents: [],
      nextCard: null,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      isGameOver: false,
    });

    // Sacar una carta aleatoria para que sea la inicial
    const firstCardIndex = Math.floor(Math.random() * STATE.gameEvents.length);
    const firstCard = STATE.gameEvents.splice(firstCardIndex, 1)[0];
    
    STATE.timelineEvents.push({ ...firstCard, isResolved: true, isCorrect: true, isAnchor: true, isExpanded: false });
    STATE.nextCard = STATE.gameEvents[0];
    
    clearGameState();
    notify();
  };

  const confirmPlacement = (cardId, newIndex) => {
    const cardToPlace = STATE.nextCard;
    if (cardToPlace.id !== cardId) return; // Seguridad

    const sortedTimeline = [...STATE.timelineEvents].sort((a, b) => a.year - b.year);
    const prevCard = sortedTimeline[newIndex - 1];
    const nextCard = sortedTimeline[newIndex];

    const prevYear = prevCard ? prevCard.year : -Infinity;
    const nextYear = nextCard ? nextCard.year : Infinity;

    const isCorrect = cardToPlace.year > prevYear && cardToPlace.year < nextYear;

    if (isCorrect) {
      STATE.streak++;
      const points = 1 + STATE.streak;
      STATE.score += points;
      STATE.correctAnswers++;
    } else {
      STATE.streak = 0;
      STATE.wrongAnswers++;
    }

    STATE.timelineEvents.push({ ...cardToPlace, isResolved: true, isCorrect, isExpanded: false });
    
    const currentCardIndexInGame = STATE.gameEvents.findIndex(e => e.id === cardId);

    if (currentCardIndexInGame + 1 >= STATE.gameEvents.length) {
      STATE.isGameOver = true;
      STATE.nextCard = null;
      clearGameState();
    } else {
      STATE.nextCard = STATE.gameEvents[currentCardIndexInGame + 1];
      saveGameState();
    }
    
    notify();
  };

  const toggleCardExpansion = (cardId) => {
    const card = STATE.timelineEvents.find(e => e.id === cardId);
    if (card) {
        card.isExpanded = !card.isExpanded;
        notify();
    }
  };

  const saveGameState = () => {
    const stateToSave = {
      gameEvents: STATE.gameEvents,
      timelineEvents: STATE.timelineEvents,
      score: STATE.score,
      correctAnswers: STATE.correctAnswers,
      wrongAnswers: STATE.wrongAnswers,
      streak: STATE.streak,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  const clearGameState = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const resumeGame = (savedState) => {
    const timelineEvents = savedState.timelineEvents.map(e => ({ ...e, isExpanded: e.isExpanded || false }));

    Object.assign(STATE, {
      gameEvents: savedState.gameEvents,
      timelineEvents: timelineEvents,
      score: savedState.score,
      correctAnswers: savedState.correctAnswers,
      wrongAnswers: savedState.wrongAnswers,
      streak: savedState.streak || 0,
      isGameOver: false,
    });
    
    const placedCardIds = new Set(STATE.timelineEvents.map(e => e.id));
    const nextCardInSequence = STATE.gameEvents.find(e => !placedCardIds.has(e.id));

    if (nextCardInSequence) {
      STATE.nextCard = nextCardInSequence;
    } else {
      STATE.isGameOver = true;
      STATE.nextCard = null;
    }

    notify();
  };

  return {
    startGame,
    confirmPlacement,
    resumeGame,
    clearGameState,
    toggleCardExpansion,
    set onStateChange(callback) {
      onStateChangeCallback = callback;
    },
    get state() {
      return STATE;
    }
  };
};
