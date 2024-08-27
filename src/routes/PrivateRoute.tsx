import { Navigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { getUserRole, isAuthenticated } from './auth';
import paths from './path'; // Ensure the correct path to paths is imported

interface PrivateRouteProps {
  element: ReactElement;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRole }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    return <Navigate to={paths.login} />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={paths.notFound} />;
  }

  return element;
};

export default PrivateRoute;
