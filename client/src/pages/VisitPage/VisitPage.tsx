import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';
import PageHeader from '../../components/PageHeader/PageHeader';
import Toast from '../../components/Toast/Toast';
import { PageRoot, FormColumn } from './styled';
import { useVisitForm } from './hooks/useVisitForm';
import { formatRecordingTime } from './constants';
import { PatientInfoBar } from './components/PatientInfoBar';
import { VisitFormCard } from './components/VisitFormCard';
import { AiSummaryPanel } from './components/AiSummaryPanel';

const VisitPage: React.FC = () => {
  const form = useVisitForm();
  const {
    navigate, isReadOnly, isLoadingVisit, isRecording, isProcessing,
    visitDate, saving, toast, setToast, patientInfo, handleSave, handleRecord, timer,
  } = form;

  const subtitle =
    isLoadingVisit ? 'טוען...'
    : isReadOnly ? visitDate ?? 'צפייה בלבד'
    : isRecording ? 'מקליט ומתעד...'
    : isProcessing ? 'מעבד...'
    : 'מוכן';

  return (
    <PageRoot>
      <PageHeader
        title={isReadOnly ? 'ביקור קודם' : 'ביקור פעיל'}
        subtitle={subtitle}
        onBack={() => navigate(-1)}
      />

      {patientInfo && <PatientInfoBar info={patientInfo} />}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, overflow: { xs: 'auto', md: 'hidden' } }}>
        <FormColumn>
          <VisitFormCard form={form} />

          {!isReadOnly && (
            <Stack spacing={1.5} sx={{ px: 0.5 }}>
              <Button fullWidth
                variant={isRecording ? 'contained' : 'outlined'}
                color={isRecording ? 'error' : 'primary'}
                startIcon={isRecording ? <StopIcon /> : <KeyboardVoiceIcon />}
                onClick={handleRecord}
                sx={{
                  borderRadius: '12px', fontWeight: 700, fontSize: 14, py: 1.375,
                  ...(isRecording ? {} : { borderColor: '#3b5bdb', color: '#3b5bdb', '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' } }),
                }}>
                {isRecording ? `עצור הקלטה  ${formatRecordingTime(timer)}` : 'הקלט שמע לביקור'}
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button variant="contained" size="large" onClick={handleSave} disabled={saving}
                  sx={{ borderRadius: '12px', px: 4.5, py: 1.5, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', background: '#3b5bdb', '&:hover': { background: '#3451c7' } }}>
                  {saving ? 'שומר…' : 'שמור ואשר'}
                </Button>
              </Box>
            </Stack>
          )}
        </FormColumn>

        <AiSummaryPanel form={form} />
      </Box>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </PageRoot>
  );
};

export default VisitPage;
