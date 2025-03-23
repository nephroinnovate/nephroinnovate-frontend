// assets
import { IconDashboard, IconUserCheck, IconSettings, IconUsersGroup, IconBuilding } from '@tabler/icons-react';

// constant
const icons = {
  IconDashboard,
  IconUserCheck,
  IconSettings,
  IconUsersGroup,
  IconBuilding
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      // Only admin and institution roles can access dashboard
      access: ['admin', 'institution']
    },
    {
      id: 'user-roles',
      title: 'User Roles Management',
      type: 'item',
      url: '/admin/user-roles',
      icon: icons.IconUserCheck,
      breadcrumbs: false,
      // Only admin can access this menu
      access: ['admin']
    },
    {
      id: 'institution-management',
      title: 'Institution Management',
      type: 'item',
      url: '/admin/institution',
      icon: icons.IconBuilding,
      breadcrumbs: false,
      // Only admin can access this menu
      access: ['admin']
    },
    {
      id: 'patients',
      title: 'Patient Management',
      type: 'item',
      url: '/patients/manage',
      icon: icons.IconUsersGroup,
      breadcrumbs: false,
      // Admin, institution and patient roles can access
      access: ['admin', 'institution', 'patient']
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'item',
      url: '/dashboard/settings',
      icon: icons.IconSettings,
      breadcrumbs: false,
      // Both admin and institution can access settings
      access: ['admin', 'institution']
    }
  ]
};

export default dashboard;
