import { DOM } from './dom.js';

let sortableTimeline, sortableNextCard;

const _handleCardDrop = (evt, gameHandlers) => {
    const droppedCard = evt.item;
    const cardId = parseInt(droppedCard.dataset.id, 10);
    const timelineCards = Array.from(DOM.timeline.children);
    const newIndex = timelineCards.indexOf(droppedCard);

    // Move card back visually, logic is handled by state update
    DOM.nextCardContainer.appendChild(droppedCard);

    gameHandlers.onConfirmPlacement(cardId, newIndex);
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
