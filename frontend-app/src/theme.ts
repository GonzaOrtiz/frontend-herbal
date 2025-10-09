import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#4f83ff',
      dark: '#1e44b8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
      light: '#4fb3a8',
      dark: '#0b544d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f5f7',
      paper: '#ffffff',
    },
    divider: '#e0e4eb',
    text: {
      primary: '#1f2937',
      secondary: '#566173',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          borderRadius: 8,
        },
      },
    },
  },
});
