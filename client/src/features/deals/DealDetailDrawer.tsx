import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Deal } from '../../api/types';
import { MoneyText } from '../../components/MoneyText';
import { PropertyImage } from '../../components/PropertyImage';
import { RiskBadge } from '../../components/RiskBadge';
import { StageChip } from '../../components/StageChip';

interface DealDetailDrawerProps {
  deal: Deal | null;
  onClose: () => void;
}

/** Slide-in analysis panel — full breakdown without leaving the pipeline. */
export function DealDetailDrawer({ deal, onClose }: DealDetailDrawerProps) {
  return (
    <Drawer anchor="right" open={deal !== null} onClose={onClose}>
      {deal && (
        <Box sx={{ width: { xs: '100vw', sm: 440 } }}>
          <Box sx={{ position: 'relative' }}>
            <PropertyImage dealId={deal.id} alt={deal.address} height={180} />
            <IconButton
              onClick={onClose}
              aria-label="Close deal details"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(12, 29, 46, 0.55)',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: 'rgba(12, 29, 46, 0.8)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="h5">{deal.address}</Typography>
            <Typography variant="body2" color="text.secondary">
              {deal.city}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ my: 2 }}>
            <StageChip stage={deal.stage} />
            <RiskBadge level={deal.riskLevel} />
          </Stack>

          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              color: '#FFFFFF',
              borderRadius: 3,
              p: 2.5,
              mb: 3,
            }}
          >
            <Typography variant="overline" sx={{ color: '#8FA6BA' }}>
              After Repair Value
            </Typography>
            <MoneyText amount={deal.afterRepairValue} variant="h4" sx={{ display: 'block', color: '#5EEAD4' }} />
            <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#8FA6BA' }}>
                  Projected profit
                </Typography>
                <MoneyText amount={deal.estimatedProfit} variant="subtitle1" sx={{ display: 'block', fontWeight: 700 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#8FA6BA' }}>
                  ROI
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {deal.roiPercent === null ? '—' : `${deal.roiPercent}%`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Typography variant="h6" gutterBottom>
            Cost breakdown
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <DetailItem label="Purchase price" value={<MoneyText amount={deal.purchasePrice} />} />
            <DetailItem label="Renovation cost" value={<MoneyText amount={deal.renovationCost} />} />
            <DetailItem
              label="Max allowable offer"
              value={<MoneyText amount={deal.maxAllowableOffer} />}
              warning={
                deal.maxAllowableOffer !== null && deal.purchasePrice > deal.maxAllowableOffer
                  ? 'Above the 70%-rule maximum'
                  : undefined
              }
            />
          </Grid>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Created {new Date(deal.createdAt).toLocaleDateString()}
          </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

function DetailItem({
  label,
  value,
  warning,
}: {
  label: string;
  value: React.ReactNode;
  warning?: string;
}) {
  return (
    <Grid size={{ xs: 6 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography component="div" variant="subtitle2">
        {value}
      </Typography>
      {warning && (
        <Typography variant="caption" sx={{ color: 'warning.main' }}>
          {warning}
        </Typography>
      )}
    </Grid>
  );
}
