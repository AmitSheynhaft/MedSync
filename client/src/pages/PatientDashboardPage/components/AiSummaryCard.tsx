import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import MedicalSummary from '../../../components/MedicalSummary';

interface AiSummaryCardProps {
  overview: string;
  onStartVisit: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ overview, onStartVisit, onRefresh, refreshing }) => (
  <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #dfe4ec', borderInlineStart: '4px solid #3b5bdb', p: { xs: 2, sm: 2.5 }, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
    <Stack sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', mb: 1.5, gap: { xs: 1.5, md: 2 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#eef2ff', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AutoAwesomeIcon fontSize="small" />
        </Box>
        <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>סיכום רפואי בבינה מלאכותית</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 999, fontWeight: 700, fontSize: 13, flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap', borderColor: '#9bb1ff', color: '#3b5bdb', px: 2, '&:hover': { borderColor: '#3b5bdb', background: '#f5f8ff' } }}
          >
            {refreshing ? 'מעדכן...' : 'רענן סיכום'}
          </Button>
        )}
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onStartVisit} sx={{ borderRadius: 999, fontWeight: 700, fontSize: 14, flex: { xs: 1, md: 'none' }, whiteSpace: 'nowrap', px: 2.25, boxShadow: 'none', '&:hover': { boxShadow: 'none', background: '#3451c7' } }}>
          התחל ביקור
        </Button>
      </Stack>
    </Stack>
    {overview ? (
      <MedicalSummary text={overview} />
    ) : (
      <Typography sx={{ fontSize: 14, color: '#495057', lineHeight: 1.7 }}>
        טרם נוצר סיכום רפואי. שמור ביקור או העלה מסמך כדי לייצר סיכום.
      </Typography>
    )}
  </Paper>
);

export default AiSummaryCard;
