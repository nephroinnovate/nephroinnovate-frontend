// material-ui
import { createTheme } from '@mui/material/styles';

// assets
import defaultColor from 'assets/scss/_themes-vars.module.scss';

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export default function Palette(mode, presetColor) {
  let colors;
  switch (presetColor) {
    case 'default':
    default:
      colors = defaultColor;
  }

  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode - keep original palette intact
            common: {
              black: colors.darkPaper
            },
            primary: {
              light: colors.primaryLight,
              main: colors.primaryMain,
              dark: colors.primaryDark,
              200: colors.primary200,
              800: colors.primary800
            },
            secondary: {
              light: colors.secondaryLight,
              main: colors.secondaryMain,
              dark: colors.secondaryDark,
              200: colors.secondary200,
              800: colors.secondary800
            },
            error: {
              light: colors.errorLight,
              main: colors.errorMain,
              dark: colors.errorDark
            },
            orange: {
              light: colors.orangeLight,
              main: colors.orangeMain,
              dark: colors.orangeDark
            },
            warning: {
              light: colors.warningLight,
              main: colors.warningMain,
              dark: colors.warningDark,
              contrastText: colors.grey700
            },
            success: {
              light: colors.successLight,
              200: colors.success200,
              main: colors.successMain,
              dark: colors.successDark
            },
            grey: {
              50: colors.grey50,
              100: colors.grey100,
              500: colors.grey500,
              600: colors.grey600,
              700: colors.grey700,
              900: colors.grey900
            },
            dark: {
              light: colors.darkTextPrimary,
              main: colors.darkLevel1,
              dark: colors.darkLevel2,
              800: colors.darkBackground,
              900: colors.darkPaper
            },
            text: {
              primary: colors.grey700,
              secondary: colors.grey500,
              dark: colors.grey900,
              hint: colors.grey100
            },
            divider: colors.grey200,
            background: {
              paper: colors.paper,
              default: colors.paper
            }
          }
        : {
            // Dark mode with blue-gray theme
            common: {
              black: '#000',
              white: '#fff'
            },
            primary: {
              light: colors.primaryLight,
              main: colors.primaryMain,
              dark: colors.primaryDark,
              200: colors.primary200,
              800: colors.primary800
            },
            secondary: {
              light: colors.secondaryLight,
              main: colors.secondaryMain,
              dark: colors.secondaryDark,
              200: colors.secondary200,
              800: colors.secondary800
            },
            error: {
              light: '#e57373',
              main: '#f44336',
              dark: '#d32f2f'
            },
            orange: {
              light: colors.orangeLight,
              main: colors.orangeMain,
              dark: colors.orangeDark
            },
            warning: {
              light: '#ffb74d',
              main: '#ff9800',
              dark: '#f57c00'
            },
            success: {
              light: '#81c784',
              main: '#4caf50',
              dark: '#388e3c',
              200: colors.success200
            },
            grey: {
              50: '#fafafa',
              100: '#f5f5f5',
              200: '#eeeeee',
              300: '#e0e0e0',
              400: '#bdbdbd',
              500: '#9e9e9e',
              600: '#757575',
              700: '#616161',
              800: '#424242',
              900: '#212121',
              A100: '#f5f5f5',
              A200: '#eeeeee',
              A400: '#bdbdbd',
              A700: '#616161'
            },
            dark: {
              light: '#ffffff',
              main: '#ffffff',
              dark: '#ffffff',
              800: '#ffffff',
              900: '#ffffff'
            },
            text: {
              primary: '#ffffff',
              secondary: '#c7c7c7',
            },
            divider: 'rgba(255, 255, 255, 0.15)',
            background: {
              default: '#121212',
              paper: '#242b38'
            },
            action: {
              active: '#ffffff',
              hover: 'rgba(255, 255, 255, 0.1)',
              hoverOpacity: 0.1,
              selected: 'rgba(255, 255, 255, 0.16)',
              selectedOpacity: 0.16,
              disabled: 'rgba(255, 255, 255, 0.5)',
              disabledBackground: 'rgba(255, 255, 255, 0.12)',
              disabledOpacity: 0.38,
              focus: 'rgba(255, 255, 255, 0.15)',
              focusOpacity: 0.15,
              activatedOpacity: 0.24
            }
          })
    }
  });
}
