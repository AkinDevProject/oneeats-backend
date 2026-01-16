/**
 * Serveur MSW pour les tests
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configure le serveur MSW avec les handlers
export const server = setupServer(...handlers);

// Export pour utilisation dans les tests
export { handlers };
