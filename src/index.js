import stylesUrl from './index.css?url';

(async () => {
  // 0️⃣ Evitar reinicialización si el script se carga varias veces
  if (window.__triviaGameLoaded) {
    console.log('▶️ Trivia Game: Ya inicializado. Saltando.');
    return;
  }
  window.__triviaGameLoaded = true;
  console.log('▶️ Trivia Game: Inicializando...');

  // 1️⃣ Helpers
  function createAndInjectLink(url, referenceNode, id) {
    if (referenceNode.parentElement.querySelector(`#${id}`)) {
      console.log(`🎨 CSS Link "${id}" ya inyectado.`);
      return;
    }
    console.log(`🎨 Creando <link> para CSS en ${url} junto a`, referenceNode);
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    // Inyectar el <link> como hermano, justo antes del contenedor del juego
    referenceNode.parentElement.insertBefore(link, referenceNode);
    console.log(`✅ <link> CSS "${id}" inyectado correctamente.`);
  }

  function onDOMReady(fn) {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  const { createGameManager } = await import('./game/manager.js');
  const { createUIManager } = await import('./ui/uiManager.js');

  // 2️⃣ Función principal de la aplicación
  async function main() {
    console.log('🚀 Ejecutando main()...');

    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      // `stylesUrl` es la URL correcta tanto en dev como en prod gracias a `?url`
      createAndInjectLink(stylesUrl, mainContainer, 'trivia-main-styles');
    } else {
      console.error('❌ No se encontró #main-container para inyectar el CSS.');
    }

    document.documentElement.classList.remove('tw-pending');

    let allEvents = [];
    try {
      // Se añade un timestamp para evitar problemas de caché en el CMS
      const response = await fetch(`https://narrativas.ideal.es/juego-historia/events.json?t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      allEvents = await response.json();
      console.log('✅ Eventos cargados correctamente.');
    } catch (error) {
      console.error('❌ No se pudieron cargar los eventos:', error);
      if(mainContainer) mainContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Error: No se pudieron cargar los datos del juego.</p>';
      return;
    }

    const game = createGameManager(allEvents);
    const ui = createUIManager();

    game.onStateChange = (newState) => ui.update(newState);

    const handlers = {
      onStartGame: () => game.startGame(),
      onConfirmPlacement: (cardId, index) => game.confirmPlacement(cardId, index),
      onToggleCardExpansion: (cardId) => game.toggleCardExpansion(cardId),
    };

    ui.init(handlers);
    ui.update(game.state);
    console.log('🧩 Juego y UI inicializados.');

    const savedStateJSON = localStorage.getItem('triviaGameState');
    if (savedStateJSON) {
      console.log('💾 Partida guardada encontrada.');
      const savedState = JSON.parse(savedStateJSON);
      ui.showResumeGameModal(
        () => game.resumeGame(savedState),
        () => {
          game.clearGameState();
          game.startGame();
        }
      );
    }
  }

  // 3️⃣ Estrategia de lanzamiento robusta
  function launchApp() {
    onDOMReady(main);
  }

  if (document.getElementById('main-container')) {
    console.log('✅ Contenedor principal encontrado. Lanzando app...');
    launchApp();
  } else {
    console.warn('⚠️ Contenedor principal no encontrado. Esperando a que aparezca dinámicamente...');
    const observer = new MutationObserver((mutations, obs) => {
      if (document.getElementById('main-container')) {
        console.log('✅ Contenedor principal detectado por MutationObserver. Lanzando app.');
        obs.disconnect();
        launchApp();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

})();
