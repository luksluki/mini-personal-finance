import { treaty } from '@elysiajs/eden';
import type { App } from '../../../backend/index';

// If running in development (Vite), point to the local backend port 3000.
// In production (Docker), the frontend is served from the same origin as the API (via Nginx proxy).
const API_URL = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

export const api = treaty<App>(API_URL);
