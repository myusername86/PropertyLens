import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import { Link } from 'react-router-dom';
import { DealStage } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { MoneyText } from '../components/MoneyText';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useDeals } from '../features/deals/hooks';

export function DashboardPage() {
  const { data: deals, isLoading, error } = useDeals();

  if (error) {
    return <Alert severity="error">Could not load deals: {error.message}</Alert>;
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((n) => (
          <Grid key={n} size={{ xs: 12, sm: 6, md: 3 }}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const all = deals ?? [];

  if (all.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Portfolio overview" />
        <EmptyState
          title="No deals yet"
          description="Add your first property and PropertyLens will calculate its ARV, profit, and risk."
          action={
            <Button component={Link} to="/deals/new" variant="contained">
              Analyze a property
            </Button>
          }
        />
      </>
    );
  }

  const approved = all.filter((deal) => deal.stage === DealStage.Approved);
  const inPipeline = all.filter(
    (deal) => deal.stage === DealStage.New || deal.stage === DealStage.Analyzing,
  );
  const totalProjectedProfit = approved.reduce(
    (sum, deal) => sum + (deal.estimatedProfit ?? 0),
    0,
  );
  const analyzedRois = all
    .map((deal) => deal.roiPercent)
    .filter((roi): roi is number => roi !== null);
  const averageRoi =
    analyzedRois.length > 0
      ? (analyzedRois.reduce((sum, roi) => sum + roi, 0) / analyzedRois.length).toFixed(1)
      : null;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Portfolio overview"
        action={
          <Button component={Link} to="/deals/new" variant="contained">
            Analyze a property
          </Button>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Deals in pipeline" value={inPipeline.length} hint="New + analyzing" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Approved deals" value={approved.length} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Projected profit"
            value={<MoneyText amount={totalProjectedProfit} variant="h5" />}
            hint="Approved deals"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Average ROI" value={averageRoi === null ? '—' : `${averageRoi}%`} hint="All analyzed deals" />
        </Grid>
      </Grid>
    </>
  );
}
