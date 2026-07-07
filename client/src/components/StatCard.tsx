import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type StatTint = 'teal' | 'violet' | 'amber' | 'blue';

/**
 * Colorful glassmorphism: each tint is a translucent gradient over blur,
 * with a matching border and hover glow. Kept subtle enough that the
 * KPI number stays the hero.
 */
const tints: Record<
  StatTint,
  { gradient: string; border: string; glow: string; icon: string }
> = {
  teal: {
    gradient: 'linear-gradient(135deg, rgba(20, 240, 200, 0.14) 0%, rgba(20, 240, 200, 0.03) 55%, rgba(255, 255, 255, 0.04) 100%)',
    border: 'rgba(20, 240, 200, 0.28)',
    glow: 'rgba(20, 240, 200, 0.22)',
    icon: '#14F0C8',
  },
  violet: {
    gradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.16) 0%, rgba(167, 139, 250, 0.04) 55%, rgba(255, 255, 255, 0.04) 100%)',
    border: 'rgba(167, 139, 250, 0.30)',
    glow: 'rgba(167, 139, 250, 0.24)',
    icon: '#A78BFA',
  },
  amber: {
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.04) 55%, rgba(255, 255, 255, 0.04) 100%)',
    border: 'rgba(251, 191, 36, 0.28)',
    glow: 'rgba(251, 191, 36, 0.20)',
    icon: '#FBBF24',
  },
  blue: {
    gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.16) 0%, rgba(96, 165, 250, 0.04) 55%, rgba(255, 255, 255, 0.04) 100%)',
    border: 'rgba(96, 165, 250, 0.30)',
    glow: 'rgba(96, 165, 250, 0.24)',
    icon: '#60A5FA',
  },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  trendUp?: boolean;
  tint?: StatTint;
}

export function StatCard({ label, value, hint, icon, trendUp = false, tint = 'teal' }: StatCardProps) {
  const palette = tints[tint];

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: palette.gradient,
        borderColor: palette.border,
        '@media (prefers-reduced-motion: no-preference)': {
          '&:hover': {
            boxShadow: `0 0 0 1px ${palette.border}, 0 14px 40px ${palette.glow}`,
            borderColor: palette.border,
          },
        },
        /* Ambient sheen that drifts across the glass. */
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.07) 48%, transparent 62%)',
          backgroundSize: '260% 100%',
          '@media (prefers-reduced-motion: no-preference)': {
            animation: 'sheenDrift 7s ease-in-out infinite',
          },
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          {icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${palette.border}`,
                color: palette.icon,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="h5">{value}</Typography>
          {trendUp && <TrendingUpIcon fontSize="small" sx={{ color: palette.icon }} />}
        </Stack>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
