export function simulateNetwork(ms = 500) {
  return new Promise(resolve => {
    setTimeout(resolve, ms + Math.random() * 200);
  });
}

export function simulateError(probability = 0.1) {
  if (Math.random() < probability) {
    throw new Error('Simulated network error');
  }
}