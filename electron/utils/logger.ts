export const logger = {
  info(message: string, payload?: unknown) {
    console.log(`[LippTV] ${message}`, payload ?? "");
  },
  warn(message: string, payload?: unknown) {
    console.warn(`[LippTV] ${message}`, payload ?? "");
  },
  error(message: string, payload?: unknown) {
    console.error(`[LippTV] ${message}`, payload ?? "");
  }
};
