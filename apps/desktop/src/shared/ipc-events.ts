/** Main → renderer: sent when DB is initialized and ready. */
export const DB_READY_CHANNEL = 'db:ready';

/** Main → renderer: sent when DB initialization fails. Payload: error message string. */
export const DB_INIT_ERROR_CHANNEL = 'db:init-error';

/** Renderer → main: renderer signals it is ready to receive db:ready. */
export const DB_REQUEST_READY_CHANNEL = 'db:request-ready';
