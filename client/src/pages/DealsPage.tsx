import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { DealStage } from '../api/types';
import type { Deal } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { DealCard } from '../features/deals/DealCard';
import { useDeals } from '../features/deals/hooks';

const columns: { stage: DealStage; title: string }[] = [
  { stage: DealStage.New, title: 'New' },
  { stage: DealStage.Analyzing, title: 'Analyzing' },
  { stage: DealStage.Approved, title: 'Approved' },
  { stage: DealStage.Rejected, title: 'Rejected' },
];

export function DealsPage() {
  const { data: deals, isLoading, error } = useDeals();

  if (error) {
    return <Alert severity="error">Could not load deals: {error.message}</Alert>;
  }

  const all = deals ?? [];

  return (
    <>
      <PageHeader
        title="Deal pipeline"
        subtitle="Move deals from analysis to decision"
        action={
          <Button component={Link} to="/deals/new" variant="contained">
            Analyze a property
          </Button>
        }
      />

      {!isLoading && all.length === 0 ? (
        <EmptyState
          title="Your pipeline is empty"
          description="Every deal you analyze appears here, moving from New to Approved or Rejected."
          action={
            <Button component={Link} to="/deals/new" variant="contained">
              Analyze a property
            </Button>
          }
        />
      ) : (
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
          {columns.map(({ stage, title }) => {
            const columnDeals = all.filter((deal) => deal.stage === stage);
            return (
              <Box
                key={stage}
                sx={{
                  minWidth: 280,
                  flex: '1 1 0',
                  backgroundColor: '#F1F3F0',
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5, px: 0.5 }}>
                  {title}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({columnDeals.length})
                  </Typography>
                </Typography>
                <Stack spacing={1.5}>
                  {isLoading ? (
                    <Skeleton variant="rounded" height={140} />
                  ) : (
                    columnDeals.map((deal: Deal) => <DealCard key={deal.id} deal={deal} />)
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}
