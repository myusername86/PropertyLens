import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PercentIcon from '@mui/icons-material/Percent';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { DealStage } from '../api/types';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ProfitCompositionChart } from '../components/charts/ProfitCompositionChart';
import { RoiByDealChart } from '../components/charts/RoiByDealChart';
import { DealCard } from '../features/deals/DealCard';
import { useDeals } from '../features/deals/hooks';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Staggered entrance: each card rises in slightly after the previous one. */
const rise = (order: number) => ({
  className: 'rise-in',
  style: { animationDelay: `${order * 70}ms` },
});

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
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 6 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const all = deals ?? [];

  if (all.length === 0) {
    return (
      <>
        <PageHeader title="Portfolio overview" subtitle="Your investment intelligence at a glance" />
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
      ? analyzedRois.reduce((sum, roi) => sum + roi, 0) / analyzedRois.length
      : null;
  const recent = [...all]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <>
      <PageHeader
        title="Portfolio overview"
        subtitle="Your investment intelligence at a glance"
        action={
          <Button component={Link} to="/deals/new" variant="contained">
            Analyze a property
          </Button>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} {...rise(0)}>
          <StatCard
            label="Deals in pipeline"
            value={<AnimatedNumber value={inPipeline.length} />}
            hint="New + analyzing"
            icon={<ViewKanbanIcon fontSize="small" />}
            tint="blue"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} {...rise(1)}>
          <StatCard
            label="Approved deals"
            value={<AnimatedNumber value={approved.length} />}
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            tint="teal"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} {...rise(2)}>
          <StatCard
            label="Projected profit"
            value={
              <AnimatedNumber
                value={totalProjectedProfit}
                format={(current) => currency.format(current)}
              />
            }
            hint="Approved deals"
            icon={<AccountBalanceWalletIcon fontSize="small" />}
            tint="violet"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} {...rise(3)}>
          <StatCard
            label="Average ROI"
            value={
              averageRoi === null ? (
                '—'
              ) : (
                <AnimatedNumber value={averageRoi} format={(current) => `${current.toFixed(1)}%`} />
              )
            }
            hint="All analyzed deals"
            icon={<PercentIcon fontSize="small" />}
            trendUp={averageRoi !== null && averageRoi > 0}
            tint="amber"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }} {...rise(4)}>
          <RoiByDealChart deals={all} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} {...rise(5)}>
          <ProfitCompositionChart deals={all} />
        </Grid>

        <Grid size={{ xs: 12 }} {...rise(6)}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5, mt: 1 }}>
            <Typography variant="h6">Recent properties</Typography>
            <Button component={Link} to="/deals" size="small">
              View pipeline
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1.5 }}>
            {recent.map((deal) => (
              <Box key={deal.id} sx={{ minWidth: 260, maxWidth: 260, flexShrink: 0 }}>
                <DealCard deal={deal} />
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
