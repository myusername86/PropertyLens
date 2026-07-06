import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Deal } from '../api/types';
import { MoneyText } from '../components/MoneyText';
import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { useCreateDeal } from '../features/deals/hooks';

interface ComparableRow {
  address: string;
  salePrice: string;
  adjustmentFactor: string;
}

const emptyComparable: ComparableRow = { address: '', salePrice: '', adjustmentFactor: '1.0' };

export function NewDealPage() {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [renovationCost, setRenovationCost] = useState('');
  const [holdingCosts, setHoldingCosts] = useState('0');
  const [comparables, setComparables] = useState<ComparableRow[]>([{ ...emptyComparable }]);
  const [verdict, setVerdict] = useState<Deal | null>(null);

  const createDeal = useCreateDeal();

  const updateComparable = (index: number, patch: Partial<ComparableRow>) => {
    setComparables((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const analyze = () => {
    setVerdict(null);
    createDeal.mutate(
      {
        address,
        city,
        state: null,
        purchasePrice: Number(purchasePrice),
        renovationCost: Number(renovationCost || 0),
        holdingCosts: Number(holdingCosts || 0),
        comparables: comparables
          .filter((row) => row.address.trim() !== '' && row.salePrice !== '')
          .map((row) => ({
            address: row.address,
            salePrice: Number(row.salePrice),
            adjustmentFactor: Number(row.adjustmentFactor || 1),
          })),
      },
      { onSuccess: (deal) => setVerdict(deal) },
    );
  };

  const canSubmit =
    address.trim() !== '' &&
    city.trim() !== '' &&
    Number(purchasePrice) > 0 &&
    comparables.some((row) => row.address.trim() !== '' && Number(row.salePrice) > 0);

  return (
    <>
      <PageHeader
        title="Analyze a property"
        subtitle="Enter the numbers — PropertyLens computes ARV, profit, and risk"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField label="Address" fullWidth value={address} onChange={(e) => setAddress(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="City" fullWidth value={city} onChange={(e) => setCity(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Purchase price"
                    type="number"
                    fullWidth
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Renovation cost"
                    type="number"
                    fullWidth
                    value={renovationCost}
                    onChange={(e) => setRenovationCost(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Holding costs"
                    type="number"
                    fullWidth
                    value={holdingCosts}
                    onChange={(e) => setHoldingCosts(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Comparable sales</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setComparables((rows) => [...rows, { ...emptyComparable }])}
                >
                  Add comparable
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Recently sold, similar properties nearby. The adjustment factor compensates for
                differences (1.0 = identical, 1.05 = comp is 5% better).
              </Typography>

              <Stack spacing={1.5}>
                {comparables.map((row, index) => (
                  <Stack key={index} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <TextField
                      label="Address"
                      size="small"
                      sx={{ flex: 2 }}
                      value={row.address}
                      onChange={(e) => updateComparable(index, { address: e.target.value })}
                    />
                    <TextField
                      label="Sale price"
                      size="small"
                      type="number"
                      sx={{ flex: 1 }}
                      value={row.salePrice}
                      onChange={(e) => updateComparable(index, { salePrice: e.target.value })}
                    />
                    <TextField
                      label="Adjustment"
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { step: 0.05, min: 0.5, max: 1.5 } }}
                      sx={{ flex: 1 }}
                      value={row.adjustmentFactor}
                      onChange={(e) => updateComparable(index, { adjustmentFactor: e.target.value })}
                    />
                    <IconButton
                      aria-label="Remove comparable"
                      onClick={() => setComparables((rows) => rows.filter((_, i) => i !== index))}
                      disabled={comparables.length === 1}
                    >
                      <DeleteOutlinedIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              {createDeal.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createDeal.error.message}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={analyze}
                disabled={!canSubmit || createDeal.isPending}
              >
                {createDeal.isPending ? 'Analyzing…' : 'Run analysis'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          {verdict ? (
            <Card sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Investment verdict</Typography>
                  <RiskBadge level={verdict.riskLevel} />
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    After Repair Value
                  </Typography>
                  <MoneyText amount={verdict.afterRepairValue} variant="h4" sx={{ display: 'block' }} />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
                      Estimated profit
                    </Typography>
                    <MoneyText amount={verdict.estimatedProfit} variant="h6" />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
                      ROI
                    </Typography>
                    <Typography variant="h6">
                      {verdict.roiPercent === null ? '—' : `${verdict.roiPercent}%`}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
                      Maximum allowable offer (70% rule)
                    </Typography>
                    <MoneyText amount={verdict.maxAllowableOffer} variant="h6" />
                    {verdict.maxAllowableOffer !== null &&
                      verdict.purchasePrice > verdict.maxAllowableOffer && (
                        <Typography variant="body2" sx={{ color: 'warning.main', mt: 0.5 }}>
                          Purchase price is above the recommended maximum offer.
                        </Typography>
                      )}
                  </Grid>
                </Grid>

                <Button component={Link} to="/deals" sx={{ mt: 2 }}>
                  View in pipeline
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ backgroundColor: '#F1F3F0', borderStyle: 'dashed' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Verdict appears here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in the property numbers and at least one comparable sale, then run the
                  analysis. You will get the After Repair Value, projected profit, ROI, the
                  maximum you should offer, and a risk rating.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </>
  );
}
