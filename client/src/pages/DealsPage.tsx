import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DealStage } from '../api/types';
import type { Deal } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { DealCard } from '../features/deals/DealCard';
import { DealDetailDrawer } from '../features/deals/DealDetailDrawer';
import { useDeals } from '../features/deals/hooks';
import { useUiStore } from '../store/uiStore';

const columns: { stage: DealStage; title: string }[] = [
  { stage: DealStage.New, title: 'New' },
  { stage: DealStage.Analyzing, title: 'Analyzing' },
  { stage: DealStage.Approved, title: 'Approved' },
  { stage: DealStage.Rejected, title: 'Rejected' },
];

export function DealsPage() {
  const { data: deals, isLoading, error } = useDeals();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const searchQuery = useUiStore((state) => state.searchQuery).trim().toLowerCase();

  if (error) {
    return <Alert severity="error">Could not load deals: {error.message}</Alert>;
  }

  const all = (deals ?? []).filter(
    (deal) =>
      searchQuery === '' ||
      deal.address.toLowerCase().includes(searchQuery) ||
      deal.city.toLowerCase().includes(searchQuery),
  );

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
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
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
                    columnDeals.map((deal: Deal, index: number) => (
                      <div key={deal.id} className="rise-in" style={{ animationDelay: `${index * 60}ms` }}>
                        <DealCard deal={deal} onOpen={() => setSelectedDeal(deal)} />
                      </div>
                    ))
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
      <DealDetailDrawer deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </>
  );
}
