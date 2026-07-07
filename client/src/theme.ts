import { createTheme } from '@mui/material/styles';

/**
 * PropertyLens design tokens — v3 "midnight glass".
 * Deep navy canvas, glassmorphism cards (translucent white + blur),
 * teal-cyan as the single data/action accent with glow on interaction.
 * Risk colors are used exclusively for risk semantics.
 */
export const riskColors = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F87171',
  unknown: '#94A3B8',
} as const;

export const surfaces = {
  canvas: '#0A1428',
  sidebar: '#0F1A2E',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHoverBorder: 'rgba(20, 240, 200, 0.35)',
} as const;

export const accent = '#14F0C8';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: accent, light: '#5FFAE0', dark: '#0BBFA0', contrastText: '#04211B' },
    background: { default: surfaces.canvas, paper: surfaces.sidebar },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    divider: surfaces.glassBorder,
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontFamily: '"Space Grotesk", "Inter", sans-serif', fontWeight: 600 },
    overline: { letterSpacing: '0.08em', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: surfaces.glass,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${surfaces.glassBorder}`,
          borderRadius: 24,
          transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 260ms ease, border-color 260ms ease',
          '@media (prefers-reduced-motion: no-preference)': {
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 0 0 1px rgba(20, 240, 200, 0.18), 0 12px 32px rgba(0, 0, 0, 0.45)',
              borderColor: surfaces.glassHoverBorder,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: '0 2px 8px rgba(20, 240, 200, 0.25)',
          '&:hover': { boxShadow: '0 4px 20px rgba(20, 240, 200, 0.45)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: surfaces.sidebar, backgroundImage: 'none' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
  },
});
