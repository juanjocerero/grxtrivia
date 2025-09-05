import Sortable from 'sortablejs';
import { DOM } from './dom.js';

let sortableTimeline, sortableNextCard;

const _handleCardDrop = (evt, gameHandlers) => {
    const droppedCard = evt.item;
    const cardId = parseInt(droppedCard.dataset.id, 10);

    // Prevent adding multiple overlays
    if (droppedCard.querySelector('.confirm-overlay')) {
        return;
    }

    // Add blur effect to card content
    const cardContent = droppedCard.querySelector('.card-content');
    if (cardContent) {
        cardContent.classList.add('card-blur');
    }

    // Create and show confirmation overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirmar';
    confirmButton.className = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg';
    overlay.appendChild(confirmButton);
    
    droppedCard.appendChild(overlay);

    // Handle confirmation
    confirmButton.addEventListener('click', (e) => {
        e.stopPropagation();

        const timelineCards = Array.from(DOM.timeline.children);
        const newIndex = timelineCards.indexOf(droppedCard);

        // Remove overlay and blur
        if (cardContent) {
            cardContent.classList.remove('card-blur');
        }
        overlay.remove();

        // Move card back visually, state update will re-render it
        DOM.nextCardContainer.appendChild(droppedCard);

        // Call the game logic handler
        gameHandlers.onConfirmPlacement(cardId, newIndex);

    }, { once: true });
};

export const initSortable = (gameHandlers) => {
  sortableTimeline = new Sortable(DOM.timeline, {
    group: { name: 'timeline-game', pull: false, put: true },
    sort: true,
    filter: '.correct, .incorrect, .anchor-card',
    animation: 150,
    ghostClass: 'card-ghost',
    onAdd: (evt) => _handleCardDrop(evt, gameHandlers)
  });

  sortableNextCard = new Sortable(DOM.nextCardContainer, {
    group: { name: 'timeline-game', pull: true, put: false },
    animation: 150,
    ghostClass: 'card-ghost'
  });
};

export const toggleSortable = (enabled) => {
  if (sortableTimeline) {
    sortableTimeline.option("disabled", !enabled);
    sortableNextCard.option("disabled", !enabled);
  }
};