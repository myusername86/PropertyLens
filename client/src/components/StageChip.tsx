import Chip from '@mui/material/Chip';
import { DealStage } from '../api/types';

const stageConfig: Record<DealStage, { label: string; color: 'default' | 'info' | 'success' | 'error' }> = {
  [DealStage.New]: { label: 'New', color: 'default' },
  [DealStage.Analyzing]: { label: 'Analyzing', color: 'info' },
  [DealStage.Approved]: { label: 'Approved', color: 'success' },
  [DealStage.Rejected]: { label: 'Rejected', color: 'error' },
};

export function StageChip({ stage }: { stage: DealStage }) {
  const { label, color } = stageConfig[stage];
  return <Chip label={label} color={color} size="small" variant="outlined" />;
}
