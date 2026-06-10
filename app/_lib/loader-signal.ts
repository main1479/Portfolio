// Lets the hero (and anything else) start its entrance exactly as the intro
// loader lifts, instead of guessing with a hardcoded delay. Module state is
// shared because publisher and subscribers ship in the same client bundle.

let done = false;
const listeners = new Set<() => void>();

export function signalLoaderDone() {
  if (done) return;
  done = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

/** Runs `cb` when the loader finishes — immediately if it already has. */
export function onLoaderDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
