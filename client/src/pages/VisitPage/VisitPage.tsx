import React from 'react';
import { Box, Button } from '@mui/material';
import PageHeader from '../../components/PageHeader/PageHeader';
import Toast from '../../components/Toast/Toast';
import { PageRoot, FormColumn } from './styled';
import { useVisitForm } from './hooks/useVisitForm';
import { PatientInfoBar } from './components/PatientInfoBar';
import { VisitFormCard } from './components/VisitFormCard';

const VisitPage: React.FC = () => {
  const form = useVisitForm();
  const {
    navigate, isReadOnly, isLoadingVisit, isRecording, isProcessing,
    visitDate, saving, toast, setToast, patientInfo, handleSave,
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

      <FormColumn>
        <VisitFormCard form={form} />

        {!isReadOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 0.5 }}>
            <Button variant="contained" size="large" onClick={handleSave} disabled={saving}
              sx={{ borderRadius: '12px', px: 4.5, py: 1.5, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', background: '#3b5bdb', '&:hover': { background: '#3451c7' } }}>
              {saving ? 'שומר…' : 'שמור ואשר'}
            </Button>
          </Box>
        )}
      </FormColumn>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </PageRoot>
  );
};

export default VisitPage;
