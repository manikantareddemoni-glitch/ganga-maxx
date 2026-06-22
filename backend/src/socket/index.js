let ioInstance;

export function registerSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Connection established silently
  });
}

export function emitEvent(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
}
