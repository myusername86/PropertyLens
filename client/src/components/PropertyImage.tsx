import Box from '@mui/material/Box';
import { useState } from 'react';
import { propertyImageUrl } from '../lib/propertyImage';

interface PropertyImageProps {
  dealId: string;
  alt: string;
  height: number;
  /** Zoom slightly on parent hover (Zillow-style). Parent needs overflow hidden. */
  zoomOnHover?: boolean;
}

/**
 * Property photo with a graceful fallback: if the image fails to load,
 * an ink-gradient placeholder keeps the layout intact.
 */
export function PropertyImage({ dealId, alt, height, zoomOnHover = false }: PropertyImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Box
        sx={{
          height,
          background: 'linear-gradient(135deg, #0C1D2E 0%, #12283D 60%, #14B8A6 180%)',
        }}
        aria-hidden
      />
    );
  }

  return (
    <Box sx={{ height, overflow: 'hidden' }}>
      <Box
        component="img"
        src={propertyImageUrl(dealId)}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          '@media (prefers-reduced-motion: no-preference)': {
            transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
            ...(zoomOnHover && { '.MuiCard-root:hover &': { transform: 'scale(1.06)' } }),
          },
        }}
      />
    </Box>
  );
}
