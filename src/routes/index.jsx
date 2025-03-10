import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes, { HomeRoute } from './MainRoutes';
import ErrorBoundary from './ErrorBoundary';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([
  {
    ...HomeRoute,
    errorElement: <ErrorBoundary />
  },
  {
    ...MainRoutes,
    errorElement: <ErrorBoundary />
  },
  {
    ...AuthenticationRoutes,
    errorElement: <ErrorBoundary />
  }
], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
