import { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import useConfig from 'hooks/useConfig';
import { Card, Box, Typography, Switch, Stack, FormControlLabel } from '@mui/material';
import { IconSun, IconMoon } from '@tabler/icons-react';

// ==============================|| SIDEBAR - DARK MODE MENU CARD ||============================== //

function DarkModeMenuCard() {
  const theme = useTheme();
  const { mode, onChangeMode } = useConfig();

  const toggleDarkMode = () => {
    onChangeMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Card
      sx={{
        bgcolor: mode === 'dark' ? '#2a3142' : 'primary.light',
        mb: 2.75,
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 157,
          height: 157,
          bgcolor: mode === 'dark' ? '#242b38' : 'primary.200',
          borderRadius: '50%',
          top: -105,
          right: -96
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, color: mode === 'dark' ? 'text.primary' : 'primary.800' }}>
          Theme Mode
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconSun size="20px" color={theme.palette.mode === 'dark' ? 'gray' : theme.palette.warning.dark} />
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleDarkMode}
                name="darkMode"
                color="primary"
              />
            }
            label=""
          />
          <IconMoon size="20px" color={theme.palette.mode === 'dark' ? theme.palette.primary.main : 'gray'} />
        </Stack>

        <Typography variant="body2" sx={{ mt: 1.5, color: mode === 'dark' ? 'text.secondary' : 'primary.800' }}>
          {mode === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
        </Typography>
      </Box>
    </Card>
  );
}

export default memo(DarkModeMenuCard);
