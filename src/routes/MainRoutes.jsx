import { lazy, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import MinimalLayout from 'layout/MinimalLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Settings = Loadable(lazy(() => import('views/dashboard/Settings')));

// patient management
const PatientManagement = Loadable(lazy(() => import('views/patients/PatientManagement')));
const PatientDialysisData = Loadable(lazy(() => import('views/patients/PatientDialysisData')));

// home page
const HomePage = Loadable(lazy(() => import('views/home')));

// admin pages
const UserRolesManagement = Loadable(lazy(() => import('views/admin/UserRolesManagement')));
const InstitutionManagement = Loadable(lazy(() => import('views/admin/InstitutionManagement')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// account settings
const AccountSettings = Loadable(lazy(() => import('views/account/AccountSettings')));

// Admin-only route protection
const AdminRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    if (userRole !== 'admin') {
      setIsAdmin(false);
      // Show an alert and redirect to homepage
      alert('You do not have permission to access this page. Admin access required.');
      navigate('/');
    }
  }, [userRole, navigate]);

  if (!isAdmin) {
    return null;
  }

  return children;
};

// Dashboard route protection - only admin and institution can access
const DashboardRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
      // Only admin and institution_user roles can access dashboard
      if (userRole !== 'admin' && userRole !== 'institution_user') {
      setHasAccess(false);
      // Show an alert and redirect to homepage
      alert('You do not have permission to access the dashboard.');
      navigate('/');
    }
  }, [userRole, navigate]);

  if (!hasAccess) {
    return null;
  }

  return children;
};

// Authorized route - checks against an array of allowed roles
const AuthorizedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Check if user role is in the allowed roles array
    if (!allowedRoles.includes(userRole)) {
      setHasAccess(false);
      // Show an alert and redirect to homepage
      alert('You do not have permission to access this page.');
      navigate('/');
    }
  }, [userRole, navigate, allowedRoles]);

  if (!hasAccess) {
    return null;
  }

  return children;
};

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardRoute><DashboardDefault /></DashboardRoute>
        },
        {
          path: 'settings',
          element: <DashboardRoute><Settings /></DashboardRoute>
        }
      ]
    },
    {
      path: 'admin',
      children: [
        {
          path: 'user-roles',
          element: <AdminRoute><UserRolesManagement /></AdminRoute>
        },
        {
          path: 'institution',
          element: <AdminRoute><InstitutionManagement /></AdminRoute>
        }
      ]
    },
    {
      path: 'patients',
      children: [
        {
          path: 'manage',
            element: <AuthorizedRoute
                allowedRoles={['admin', 'institution_user', 'patient']}><PatientManagement/></AuthorizedRoute>
        },
        {
          path: 'dialysis-data',
          element: <AuthorizedRoute allowedRoles={['patient']}><PatientDialysisData /></AuthorizedRoute>
        }
      ]
    },
    {
      path: 'typography',
      element: <DashboardRoute><UtilsTypography /></DashboardRoute>
    },
    {
      path: 'color',
      element: <DashboardRoute><UtilsColor /></DashboardRoute>
    },
    {
      path: 'shadow',
      element: <DashboardRoute><UtilsShadow /></DashboardRoute>
    },
    {
      path: '/sample-page',
      element: <DashboardRoute><SamplePage /></DashboardRoute>
    },
    {
      path: 'account',
      children: [
        {
          path: 'settings',
            element: <AuthorizedRoute
                allowedRoles={['admin', 'institution_user', 'patient']}><AccountSettings/></AuthorizedRoute>
        }
      ]
    },
  ]
};

const HomeRoute = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/',
      element: <HomePage />
    }
  ]
};

export { HomeRoute };
export default MainRoutes;
