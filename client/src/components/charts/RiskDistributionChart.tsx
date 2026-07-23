import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Deal } from '../../api/types';
import { RiskLevel } from '../../api/types';
import { riskColors } from '../../theme';

interface RiskDistributionChartProps {
  deals: Deal[];
}

/** Donut chart showing how the portfolio splits across risk levels. */
export function RiskDistributionChart({ deals }: RiskDistributionChartProps) {
  const counts = {
    low: deals.filter((d) => d.riskLevel === RiskLevel.Low).length,
    medium: deals.filter((d) => d.riskLevel === RiskLevel.Medium).length,
    high: deals.filter((d) => d.riskLevel === RiskLevel.High).length,
    unknown: deals.filter((d) => d.riskLevel === RiskLevel.Unknown).length,
  };

  const data = [
    { name: 'Low risk', value: counts.low, color: riskColors.low },
    { name: 'Medium risk', value: counts.medium, color: riskColors.medium },
    { name: 'High risk', value: counts.high, color: riskColors.high },
    { name: 'Not analyzed', value: counts.unknown, color: riskColors.unknown },
  ].filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Risk distribution
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Portfolio split by deterministic risk level
        </Typography>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F1A2E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                color: '#F1F5F9',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <Stack direction="row" spacing={3} sx={{ justifyContent: 'center', mt: 1 }}>
          {data.map((entry) => (
            <Stack key={entry.name} sx={{ alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: entry.color, fontWeight: 700 }}>
                {entry.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
