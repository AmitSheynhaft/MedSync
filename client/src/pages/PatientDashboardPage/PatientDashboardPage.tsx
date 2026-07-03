import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { getPatientById, Patient, refreshMedicalSummary, ClinicalAlert } from '../../api/patients';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getGenderLabel } from '../../utils/format';
import PageHeader from '../../components/PageHeader/PageHeader';
import InfoGrid from '../../components/InfoGrid/InfoGrid';
import DocumentSummaryModal from '../../components/DocumentSummaryModal/DocumentSummaryModal';
import { AiSummaryCard } from './components/AiSummaryCard';
import { EncountersList } from './components/EncountersList';
import { DocumentsList } from './components/DocumentsList';
import ClinicalAlertsCard from './components/ClinicalAlertsCard';

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: patient, status } = useAsyncData<Patient>(() => getPatientById(id!), [id]);
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [patientOverride, setPatientOverride] = useState<Patient | null>(null);

  const displayPatient = patientOverride ?? patient;

  function handleAlertsChange(next: ClinicalAlert[]) {
    if (!displayPatient) return;
    setPatientOverride({ ...displayPatient, clinicalAlerts: next });
    setRefreshing(true);
    refreshMedicalSummary(displayPatient.id)
      .then((updated) => setPatientOverride(updated))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }

  async function handleRefreshSummary() {
    if (!displayPatient) return;
    setRefreshing(true);
    try {
      const updated = await refreshMedicalSummary(displayPatient.id);
      setPatientOverride(updated);
    } finally {
      setRefreshing(false);
    }
  }

  if (status !== 'done' || !displayPatient) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <PageHeader
          title={status === 'loading' ? 'טוען מטופל...' : 'מטופל לא נמצא'}
          subtitle={status === 'loading' ? 'מייד נתוני המטופל' : 'המטופל הנבחר אינו קיים'}
          onBack={() => navigate('/patients')}
        />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#868e96' }}>
            {status === 'loading' ? 'אנא המתן…' : 'לא נמצא המטופל. חזור לרשימה.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const fullName = `${displayPatient.firstName} ${displayPatient.lastName}`;
  const idLabel = displayPatient.idNumber ?? displayPatient.id.slice(0, 8).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title={fullName}
        subtitle={`ת"ז: ${idLabel} • גיל ${displayPatient.age} • ${getGenderLabel(displayPatient.gender)}`}
        onBack={() => navigate('/patients')}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
        <ClinicalAlertsCard
          patientId={displayPatient.id}
          alerts={displayPatient.clinicalAlerts ?? []}
          onAlertsChange={handleAlertsChange}
        />

        <InfoGrid fields={[
          { label: 'תאריך לידה', value: displayPatient.dob },
          { label: 'טלפון',      value: displayPatient.phone },
          { label: 'קופת חולים', value: displayPatient.hmo },
          { label: 'כתובת',      value: displayPatient.address },
        ]} />

        <AiSummaryCard
          overview={displayPatient.overview}
          onStartVisit={() => navigate(`/patients/${displayPatient.id}/visit`)}
          onRefresh={handleRefreshSummary}
          refreshing={refreshing}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2, sm: 3 } }}>
          <EncountersList encounters={displayPatient.encounters} patientId={displayPatient.id} />
          <DocumentsList
            documents={displayPatient.documents}
            onUpload={() => navigate(`/patients/${displayPatient.id}/documents`)}
            onViewSummary={setSummaryModal}
          />
        </Box>
      </Box>

      {summaryModal && (
        <DocumentSummaryModal docId={summaryModal.id} docName={summaryModal.name} onClose={() => setSummaryModal(null)} />
      )}
    </Box>
  );
};

export default PatientDashboardPage;
