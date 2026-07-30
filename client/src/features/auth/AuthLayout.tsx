import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { accent } from '../../theme';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const highlights = [
  { icon: <InsightsIcon fontSize="small" />, text: 'AI-driven ARV, ROI, and risk analysis' },
  { icon: <SpeedIcon fontSize="small" />, text: 'Deal pipeline from analysis to decision' },
  { icon: <SecurityIcon fontSize="small" />, text: 'Role-based access across your team' },
];

/**
 * Shared split-screen shell for Login and Register. The left panel is
 * brand/context (never a form field), the right panel is always the
 * single-purpose form — a standard enterprise auth pattern that keeps
 * the actual task (signing in) uncluttered.
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Box className="aurora-layer" aria-hidden />

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '42%',
          p: 6,
          position: 'relative',
          zIndex: 1,
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: 0.5, color: accent }}
        >
          PropertyLens
        </Typography>

        <Box>
          <Typography variant="h4" sx={{ mb: 2, lineHeight: 1.3 }}>
            Investment intelligence for serious real estate operators.
          </Typography>
          <Stack spacing={2} sx={{ mt: 4 }}>
            {highlights.map((item) => (
              <Stack key={item.text} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: accent,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} PropertyLens
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box className="rise-in" sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
