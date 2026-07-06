import { createTheme } from '@mui/material/styles';

/**
 * PropertyLens design tokens.
 * Palette: "ledger green" primary — finance heritage, not default MUI blue.
 * Risk colors are reserved exclusively for risk semantics.
 */
export const riskColors = {
  low: '#2E7D32',
  medium: '#B26A00',
  high: '#C62828',
  unknown: '#757575',
} as const;

export const theme = createTheme({
  palette: {
    primary: { main: '#1E4D3B', light: '#2E6B52', dark: '#123227' },
    secondary: { main: '#B08D3E' },
    background: { default: '#FAFAF7', paper: '#FFFFFF' },
    text: { primary: '#1C2321', secondary: '#5C6662' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid #E4E7E4' },
      },
    },
  },
});
