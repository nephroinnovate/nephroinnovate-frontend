import { RouterProvider } from 'react-router-dom';
import Box from '@mui/material/Box';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';

// auth provider

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <Box
          sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#121212' : 'inherit',
            minHeight: '100vh',
            width: '100%'
          }}
        >
          <RouterProvider router={router} />
        </Box>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
