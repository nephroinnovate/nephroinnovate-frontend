import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContentStyled from './MainContentStyled';
import Customization from '../Customization';
import Loader from 'ui-component/Loader';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { borderRadius, miniDrawer } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerDrawerOpen(false);
  }, [downMD]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{
      display: 'flex',
      bgcolor: mode === 'dark' ? '#121212' : 'inherit'
    }}>
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: mode === 'dark' ? '#242b38' : theme.palette.background.default,
          color: mode === 'dark' ? '#ffffff' : 'text.primary'
        }}
      >
        <Toolbar sx={{ p: 2 }}>
          <Header />
        </Toolbar>
      </AppBar>

      {/* menu / drawer */}
      <Sidebar />

      {/* main content */}
      <MainContentStyled {...{ borderRadius, open: drawerOpen }}>
        <Box sx={{ ...{ px: { xs: 0 } }, minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
          {/* breadcrumb */}
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Box>
      </MainContentStyled>
      <Customization />
    </Box>
  );
}
