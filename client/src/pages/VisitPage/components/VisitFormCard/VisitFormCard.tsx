import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { FormCard } from '../../styled';
import type { VisitFormState } from '../../hooks/useVisitForm';
import { ProcessingOverlay } from '../ProcessingOverlay/ProcessingOverlay';
import { FormCardHeader } from '../FormCardHeader/FormCardHeader';
import { VisitDetailsSection } from '../VisitDetailsSection/VisitDetailsSection';
import { TextSection } from '../TextSection/TextSection';
import { VitalsSection } from '../VitalsSection/VitalsSection';
import { DiagnosesSection } from '../DiagnosesSection/DiagnosesSection';
import { MedicinesSection } from '../MedicinesSection/MedicinesSection';
import { visitFormCardIconSx } from './styles';

interface IVisitFormCardProps {
  form: VisitFormState;
}

export const VisitFormCard: React.FC<IVisitFormCardProps> = ({ form }) => (
  <FormCard>
    {form.isProcessing && <ProcessingOverlay />}

    <FormCardHeader
      isReadOnly={form.isReadOnly}
      isProcessing={form.isProcessing}
      isStarting={form.isStarting}
      isRecording={form.isRecording}
      onRecord={form.handleRecord}
    />

    <VisitDetailsSection
      visitType={form.visitType}
      setVisitType={form.setVisitType}
      followUpDate={form.followUpDate}
      setFollowUpDate={form.setFollowUpDate}
      referralNotes={form.referralNotes}
      setReferralNotes={form.setReferralNotes}
      isReadOnly={form.isReadOnly}
    />

    <TextSection
      icon={<FavoriteIcon sx={visitFormCardIconSx} />}
      label="תלונות המטופל"
      color="#e64980"
      bg="#fff0f6"
      placeholder="תלונות ותסמינים..."
      value={form.subjective}
      onChange={form.setSubjective}
      disabled={form.isProcessing || form.isReadOnly}
      highlight={form.showEmptyWarning && !form.subjective}
    />

    <TextSection
      icon={<TaskAltIcon sx={visitFormCardIconSx} />}
      label="המלצות הרופא"
      color="#2f9e44"
      bg="#ebfbee"
      placeholder="טיפול, תרופות, מעקב..."
      value={form.plan}
      onChange={form.setPlan}
      disabled={form.isReadOnly}
      highlight={form.showEmptyWarning && !form.plan}
    />

    <VitalsSection
      bloodPressure={form.bloodPressure}
      setBloodPressure={form.setBloodPressure}
      pulse={form.pulse}
      setPulse={form.setPulse}
      bodyTemp={form.bodyTemp}
      setBodyTemp={form.setBodyTemp}
      weight={form.weight}
      setWeight={form.setWeight}
      height={form.height}
      setHeight={form.setHeight}
      oxygenSat={form.oxygenSat}
      setOxygenSat={form.setOxygenSat}
      isReadOnly={form.isReadOnly}
    />

    <DiagnosesSection
      isReadOnly={form.isReadOnly}
      diagnosesList={form.diagnosesList}
      diagnosisOptions={form.diagnosisOptions}
      diagnosisSearch={form.diagnosisSearch}
      setDiagnosisSearch={form.setDiagnosisSearch}
      addDiagnosis={form.addDiagnosis}
      removeDiagnosis={form.removeDiagnosis}
    />

    <MedicinesSection
      isReadOnly={form.isReadOnly}
      medicinesList={form.medicinesList}
      medicineOptions={form.medicineOptions}
      medicineSearch={form.medicineSearch}
      setMedicineSearch={form.setMedicineSearch}
      medicineDosage={form.medicineDosage}
      setMedicineDosage={form.setMedicineDosage}
      medicineFrequency={form.medicineFrequency}
      setMedicineFrequency={form.setMedicineFrequency}
      medicineDuration={form.medicineDuration}
      setMedicineDuration={form.setMedicineDuration}
      handleAddMedicine={form.handleAddMedicine}
      removeMedicine={form.removeMedicine}
      medicineError={form.medicineError}
    />
  </FormCard>
);

export default VisitFormCard;
