import Chip from '@mui/material/Chip';
import { RiskLevel } from '../api/types';
import { riskColors } from '../theme';

const riskConfig: Record<RiskLevel, { label: string; color: string }> = {
  [RiskLevel.Low]: { label: 'Low risk', color: riskColors.low },
  [RiskLevel.Medium]: { label: 'Medium risk', color: riskColors.medium },
  [RiskLevel.High]: { label: 'High risk', color: riskColors.high },
  [RiskLevel.Unknown]: { label: 'Not analyzed', color: riskColors.unknown },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { label, color } = riskConfig[level];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        color,
        backgroundColor: `${color}14`,
        fontWeight: 600,
        border: `1px solid ${color}40`,
      }}
    />
  );
}
