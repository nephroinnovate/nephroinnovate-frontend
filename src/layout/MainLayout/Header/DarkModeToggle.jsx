import { useTheme } from '@mui/material/styles';
import useConfig from 'hooks/useConfig';
import { IconButton, Tooltip } from '@mui/material';
import { IconSun, IconMoon } from '@tabler/icons-react';

// ==============================|| DARK MODE TOGGLE ||============================== //

export default function DarkModeToggle() {
  const theme = useTheme();
  const { mode, onChangeMode } = useConfig();

  const toggleDarkMode = () => {
    onChangeMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
      <IconButton
        onClick={toggleDarkMode}
        size="medium"
        sx={{
          mr: 1.5,
          ml: { xs: 1, sm: 1.5 },
          ...theme.typography.commonAvatar,
          ...theme.typography.mediumAvatar,
          transition: 'all .2s ease-in-out',
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.secondary.light,
          color: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.dark,
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.dark,
            color: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.secondary.light
          }
        }}
        aria-label="toggle dark mode"
      >
        {mode === 'dark' ? <IconSun stroke={1.5} size="20px" /> : <IconMoon stroke={1.5} size="20px" />}
      </IconButton>
    </Tooltip>
  );
}
