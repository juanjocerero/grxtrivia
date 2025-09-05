import { createGameManager } from './game/manager.js';
import { createUIManager } from './ui/uiManager.js';
import { onDOMReady } from './utils/domReady.js';

async function main() {
  let allEvents = [];
  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allEvents = await response.json();
  } catch (error) {
    console.error('No se pudieron cargar los eventos:', error);
    // Optionally, show an error message to the user in the UI
    return;
  }

  const game = createGameManager(allEvents);
  const ui = createUIManager();

  // Conectar Modelo y Vista
  game.onStateChange = (newState) => ui.update(newState);

  const handlers = {
    onStartGame: () => game.startGame(),
    onConfirmPlacement: (cardId, index) => game.confirmPlacement(cardId, index),
  };

  ui.init(handlers);

  // Render inicial para mostrar la pantalla de bienvenida
  ui.update(game.state);

  // Comprobar si hay una partida guardada
  const savedStateJSON = localStorage.getItem('triviaGameState');
  if (savedStateJSON) {
    const savedState = JSON.parse(savedStateJSON);
    ui.showResumeGameModal(
      () => game.resumeGame(savedState),
      () => {
        game.clearGameState();
        window.location.reload(); // Recargar para un estado limpio y volver al inicio
      }
    );
  }
}

onDOMReady(main);
