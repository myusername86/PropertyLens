import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { DealStage } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { DealsOverTimeChart } from '../components/charts/DealsOverTimeChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';
import { useDeals } from '../features/deals/hooks';

const rise = (order: number) => ({
  className: 'rise-in',
  style: { animationDelay: `${order * 70}ms` },
});

export function AnalyticsPage() {
  const { data: deals, isLoading, error } = useDeals();

  if (error) {
    return <Alert severity="error">Could not load deals: {error.message}</Alert>;
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3].map((n) => (
          <Grid key={n} size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={280} sx={{ borderRadius: 6 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const all = deals ?? [];

  if (all.length === 0) {
    return (
      <>
        <PageHeader title="Analytics" subtitle="Portfolio-wide trends and risk breakdown" />
        <EmptyState
          title="Nothing to analyze yet"
          description="Analytics appear once you have analyzed at least one deal."
        />
      </>
    );
  }

  const analyzed = all.filter((deal) => deal.stage !== DealStage.New);
  const decided = all.filter(
    (deal) => deal.stage === DealStage.Approved || deal.stage === DealStage.Rejected,
  );
  const approved = all.filter((deal) => deal.stage === DealStage.Approved);
  const approvalRate = decided.length > 0 ? (approved.length / decided.length) * 100 : null;

  return (
    <>
      <PageHeader title="Analytics" subtitle="Portfolio-wide trends and risk breakdown" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }} {...rise(0)}>
          <StatCard label="Deals analyzed" value={analyzed.length} tint="blue" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} {...rise(1)}>
          <StatCard
            label="Approval rate"
            value={approvalRate === null ? '—' : `${approvalRate.toFixed(0)}%`}
            hint={`${approved.length} of ${decided.length} decided`}
            tint="teal"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} {...rise(2)}>
          <StatCard label="Total in portfolio" value={all.length} tint="violet" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} {...rise(3)}>
          <RiskDistributionChart deals={all} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} {...rise(4)}>
          <DealsOverTimeChart deals={all} />
        </Grid>
      </Grid>

      {analyzed.length < 2 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Add more deals to unlock the activity trend chart.
        </Typography>
      )}
    </>
  );
}
