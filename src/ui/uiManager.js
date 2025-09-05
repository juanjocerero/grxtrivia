import { DOM } from './dom.js';
import { render } from './renderer.js';
import { initSortable, toggleSortable } from './sortable.js';

export const createUIManager = () => {
  let gameHandlers = {};

  const init = (handlers) => {
    gameHandlers = handlers;
    DOM.startButton.addEventListener('click', () => gameHandlers.onStartGame());
    DOM.restartButton.addEventListener('click', () => gameHandlers.onStartGame());
    DOM.playAgainButton.addEventListener('click', () => {
        DOM.resultsModal.classList.add('hidden');
        gameHandlers.onStartGame();
    });
    DOM.closeResultsModalButton.addEventListener('click', () => {
        DOM.resultsModal.classList.add('hidden');
        DOM.startScreen.classList.remove('hidden');
    });

    DOM.timeline.addEventListener('click', (e) => {
        const cardElement = e.target.closest('.card-in-timeline');
        // Solo permitir expandir si el timeline está en modo denso
        if (cardElement && DOM.timeline.classList.contains('very-dense-view')) {
            const cardId = parseInt(cardElement.dataset.id, 10);
            if (gameHandlers.onToggleCardExpansion) {
                gameHandlers.onToggleCardExpansion(cardId);
            }
        }
    });

    initSortable(gameHandlers);
  };

  const showResumeGameModal = (resumeFn, clearFn) => {
    DOM.resumeModal.classList.remove('hidden');
    DOM.mainContainer.classList.add('container-blur');
    DOM.resumeYesButton.onclick = () => {
      resumeFn();
      DOM.resumeModal.classList.add('hidden');
      DOM.mainContainer.classList.remove('container-blur');
    };
    DOM.resumeNoButton.onclick = () => {
      clearFn();
      DOM.resumeModal.classList.add('hidden');
      DOM.mainContainer.classList.remove('container-blur');
    };
  };

  const update = (state) => {
    render(state);
    toggleSortable(!state.isGameOver);
  }

  return { init, update, showResumeGameModal };
};
