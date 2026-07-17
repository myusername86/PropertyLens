import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DealStage } from '../../api/types';
import type { Deal } from '../../api/types';
import { MoneyText } from '../../components/MoneyText';
import { PropertyImage } from '../../components/PropertyImage';
import { RiskBadge } from '../../components/RiskBadge';
import { useTransitionDeal } from './hooks';

interface DealCardProps {
  deal: Deal;
  onOpen?: () => void;
}

export function DealCard({ deal, onOpen }: DealCardProps) {
  const transition = useTransitionDeal();

  const act = (event: React.MouseEvent, action: 'approve' | 'reject') => {
    event.stopPropagation();
    transition.mutate({ id: deal.id, action });
  };

  return (
    <Card onClick={onOpen} sx={{ cursor: onOpen ? 'pointer' : 'default', overflow: 'hidden' }}>
      <Box sx={{ position: 'relative' }}>
        <PropertyImage dealId={deal.id} alt={deal.address} height={120} zoomOnHover />
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <RiskBadge level={deal.riskLevel} />
        </Box>
      </Box>

      <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
        <MoneyText
          amount={deal.afterRepairValue}
          variant="h6"
          sx={{ display: 'block', lineHeight: 1.2 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {deal.address}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {deal.city}
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: deal.stage === DealStage.Analyzing ? 1.5 : 0 }}>
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
            <Button
              size="small"
              variant="contained"
              onClick={(event) => act(event, 'approve')}
              disabled={transition.isPending}
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              onClick={(event) => act(event, 'reject')}
              disabled={transition.isPending}
            >
              Reject
            </Button>
          </Stack>
        )}

        {transition.isError && (
          <Alert
            severity="error"
            sx={{ mt: 1.5 }}
            onClose={(event) => {
              event.stopPropagation();
              transition.reset();
            }}
          >
            {transition.error.message}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}