import CheckIcon from '@mui/icons-material/Check';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { BillingInterval, SubscriptionPlan } from '../api/types';
import { PageHeader } from '../components/PageHeader';
import { useBillingPortal, useStartCheckout } from '../features/billing/hooks';
import { accent } from '../theme';

interface PlanDefinition {
  plan: SubscriptionPlan;
  name: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
}

const plans: PlanDefinition[] = [
  {
    plan: SubscriptionPlan.Free,
    name: 'Free',
    monthly: 0,
    yearly: 0,
    features: ['Up to 5 active deals', 'ARV, ROI & risk analysis', 'Deal pipeline'],
  },
  {
    plan: SubscriptionPlan.Pro,
    name: 'Pro',
    monthly: 29,
    yearly: 290,
    features: [
      'Up to 100 active deals',
      'Everything in Free',
      'AI investment recommendations',
      'Priority support',
    ],
    highlight: true,
  },
  {
    plan: SubscriptionPlan.Enterprise,
    name: 'Enterprise',
    monthly: 99,
    yearly: 990,
    features: [
      'Unlimited deals',
      'Everything in Pro',
      'Multi-user access',
      'Advanced analytics',
    ],
  },
];

export function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>(BillingInterval.Monthly);
  const checkout = useStartCheckout();
  const portal = useBillingPortal();

  const isYearly = interval === BillingInterval.Yearly;

  return (
    <>
      <PageHeader
        title="Plans & pricing"
        subtitle="Upgrade when you need more deals and deeper intelligence"
        action={
          <Button variant="outlined" onClick={() => portal.mutate()} disabled={portal.isPending}>
            Manage billing
          </Button>
        }
      />

      <Stack sx={{ alignItems: 'center', mb: 4 }}>
        <ToggleButtonGroup
          exclusive
          value={interval}
          onChange={(_, value: BillingInterval | null) => {
            if (value !== null) {
              setInterval(value);
            }
          }}
          size="small"
        >
          <ToggleButton value={BillingInterval.Monthly}>Monthly</ToggleButton>
          <ToggleButton value={BillingInterval.Yearly}>Yearly · 2 months free</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {checkout.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {checkout.error.message}
        </Alert>
      )}
      {portal.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {portal.error.message}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {plans.map((planDef, index) => {
          const price = isYearly ? planDef.yearly : planDef.monthly;
          const isFree = planDef.plan === SubscriptionPlan.Free;

          return (
            <Grid
              key={planDef.name}
              size={{ xs: 12, md: 4 }}
              className="rise-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(planDef.highlight && {
                    borderColor: accent,
                    boxShadow: `0 0 32px rgba(20, 240, 200, 0.15)`,
                  }),
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{planDef.name}</Typography>
                    {planDef.highlight && <Chip label="Most popular" size="small" color="primary" />}
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" component="span">
                      ${price}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary">
                      {isFree ? ' forever' : isYearly ? ' / year' : ' / month'}
                    </Typography>
                  </Box>

                  <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                    {planDef.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <CheckIcon fontSize="small" sx={{ color: accent }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {isFree ? (
                    <Button variant="outlined" disabled>
                      Included by default
                    </Button>
                  ) : (
                    <Button
                      variant={planDef.highlight ? 'contained' : 'outlined'}
                      onClick={() => checkout.mutate({ plan: planDef.plan, interval })}
                      disabled={checkout.isPending}
                    >
                      {checkout.isPending ? 'Redirecting…' : `Upgrade to ${planDef.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}