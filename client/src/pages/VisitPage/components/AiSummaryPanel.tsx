import React from 'react';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AiPanel, SummarySectionCard } from '../styled';
import { SUMMARY_SECTIONS } from '../constants';
import type { VisitFormState } from '../hooks/useVisitForm';

interface AiSummaryPanelProps {
  form: VisitFormState;
}

export const AiSummaryPanel: React.FC<AiSummaryPanelProps> = ({ form }) => {
  const { isProcessing, isSummarizing, liveSummary } = form;

  return (
    <AiPanel>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: { xs: 2, sm: 2.5 }, borderBottom: '1px solid #dfe6f1', height: { xs: 44, sm: 48 }, alignItems: 'flex-end' }}>
        <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 700, color: '#3b5bdb', borderBottom: '2px solid #3b5bdb', pb: { xs: 1.1, sm: 1.5 } }}>
          סיכום בינה מלאכותית
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: { xs: 'visible', md: 'auto' }, p: { xs: 1.5, sm: 2.5 } }}>
        {isProcessing ? (
          <Typography sx={{ fontSize: 14, color: '#868e96', textAlign: 'center', mt: 5 }}>מנתח ביקור...</Typography>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 1.25, sm: 1.75 }, background: '#f8f9fa', border: '1px solid #e1e7f0', display: 'flex', flexDirection: 'column', gap: { xs: 1.25, sm: 1.75 } }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: { xs: 30, sm: 32 }, height: { xs: 30, sm: 32 }, borderRadius: '8px', background: '#eef2ff', color: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isSummarizing ? <CircularProgress size={13} sx={{ color: '#3b5bdb' }} /> : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
              </Box>
              <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, fontWeight: 700, color: '#1a1a2e' }}>
                תובנה MedSync
                {isSummarizing && <Typography component="span" sx={{ fontWeight: 500, color: '#3b5bdb', fontSize: 11 }}> · מעדכן…</Typography>}
              </Typography>
            </Stack>
            {liveSummary ? (
              <Stack sx={{ gap: 1 }}>
                {SUMMARY_SECTIONS.map(({ key, label, icon, color, bg }) => (
                  <SummarySectionCard key={key}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icon}
                      </Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
                        {label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: { xs: 14, sm: 13 }, color: '#495057', lineHeight: 1.55, ps: { xs: 0, sm: 3.75 } }}>
                      {liveSummary[key] || 'Not documented.'}
                    </Typography>
                  </SummarySectionCard>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, color: '#adb5bd', textAlign: 'center', lineHeight: 1.5 }}>
                רשום או הקלט ביקור כדי לקבל סיכום.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    </AiPanel>
  );
};

export default AiSummaryPanel;
