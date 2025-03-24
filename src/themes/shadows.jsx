import { alpha } from '@mui/material/styles';

export default function customShadows(mode, theme) {
  const { grey } = theme.palette;

  // Simple shadow definitions that work for both light and dark modes
  return {
    button: '0 2px 0 rgba(0,0,0,0.2)',
    text: '0 -1px 0 rgba(0,0,0,0.1)',
    z1: `0px 2px 8px ${alpha(mode === 'dark' ? '#000000' : grey[900], 0.15)}`,
    primary: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
    secondary: `0 4px 14px 0 ${alpha(theme.palette.secondary.main, 0.3)}`,
    error: `0 4px 14px 0 ${alpha(theme.palette.error?.main || '#f44336', 0.3)}`,
    warning: `0 4px 14px 0 ${alpha(theme.palette.warning?.main || '#ff9800', 0.3)}`,
    success: `0 4px 14px 0 ${alpha(theme.palette.success?.main || '#4caf50', 0.3)}`,
    grey: `0 4px 14px 0 ${alpha(theme.palette.grey[500], 0.3)}`
  };
}
