import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DealStage } from '../../api/types';
import type { Deal } from '../../api/types';
import { MoneyText } from '../../components/MoneyText';
import { RiskBadge } from '../../components/RiskBadge';
import { useTransitionDeal } from './hooks';

export function DealCard({ deal }: { deal: Deal }) {
  const transition = useTransitionDeal();

  const act = (action: 'approve' | 'reject') =>
    transition.mutate({ id: deal.id, action });

  return (
    <Card>
      <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2">{deal.address}</Typography>
            <Typography variant="caption" color="text.secondary">
              {deal.city}
            </Typography>
          </Box>
          <RiskBadge level={deal.riskLevel} />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              ARV
            </Typography>
            <MoneyText amount={deal.afterRepairValue} variant="body2" sx={{ fontWeight: 600 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Profit
            </Typography>
            <MoneyText amount={deal.estimatedProfit} variant="body2" sx={{ fontWeight: 600 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              ROI
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {deal.roiPercent === null ? '—' : `${deal.roiPercent}%`}
            </Typography>
          </Box>
        </Stack>

        {deal.stage === DealStage.Analyzing && (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={() => act('approve')} disabled={transition.isPending}>
              Approve
            </Button>
            <Button size="small" color="error" onClick={() => act('reject')} disabled={transition.isPending}>
              Reject
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
