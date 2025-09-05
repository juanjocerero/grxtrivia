/* Devuelve una Promise que resuelve cuando Tailwind ha terminado
de generar las clases. Con build es inmediata; con CDN espera
al evento interno. */
export const tailwindReady = () =>
  new Promise(res => {
  if (window.tailwind?.onProcessed) {          // CDN
    tailwind.onProcessed(res);
  } else {                                     // build o ya procesado
    res();
  }
});