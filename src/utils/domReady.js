export const onDOMReady = (fn) => {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }
};
