/**
 * APP.TSX - Main entry component for ПРОМО.МУЗЫКА
 * Uses React Router (createBrowserRouter) with lazy-loaded routes.
 * Route definitions live in ./routes.ts
 */

import { RouterProvider } from 'react-router';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
