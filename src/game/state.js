export const STATE = {
  allEvents: [],
  gameEvents: [], // Los 10 eventos de la partida
  timelineEvents: [], // Eventos ya colocados en la línea de tiempo
  nextCard: null, // Siguiente carta para colocar
  score: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  streak: 0,
  isGameOver: false,
};

export const STORAGE_KEY = 'triviaGameState';
