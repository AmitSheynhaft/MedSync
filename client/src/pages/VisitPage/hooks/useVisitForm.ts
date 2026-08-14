import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import {
  createVisit, upsertVisitSummary,
  addVisitDiagnosis, addVisitMedicine, removeVisitDiagnosis, removeVisitMedicine, updateVisit, getVisit,
  VisitDiagnosisEntry, VisitMedicineEntry,
} from '../../../api/visits';
import { ToastState, DiagnosisItem, MedicineItem, PatientInfo } from '../constants';
import { parseSummaryText, buildSummaryText } from '../utils';
import { useVisitReadOnlyMode } from './useVisitReadOnlyMode';
import { useVisitCatalogOptions } from './useVisitCatalogOptions';


function getErrorMessage(error: unknown, fallback: string): string {  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function useVisitForm() {
  const navigate = useNavigate();
  const { id: patientId, visitId } = useParams<{ id: string; visitId: string }>();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId') ?? undefined;
  const { status, isStarting, transcript, summary, timer, start, stop, cancel } = useAudioRecorder();

  const [subjective, setSubjective] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);
  const isReadOnly = useVisitReadOnlyMode(!!visitId);
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [isLoadingVisit, setIsLoadingVisit] = useState(false);
  // Tracks the visit created in this session so a second save updates it
  // instead of creating a duplicate (the page no longer navigates away on save).
  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
  const isSavingRef = useRef(false);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);

  // Vitals
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [oxygenSat, setOxygenSat] = useState('');
  // Visit metadata
  const [visitType, setVisitType] = useState('');
  // Follow-up date starts empty; pre-filling today would bypass the empty-visit guard.
  const [followUpDate, setFollowUpDate] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  // Tracks codes/keys of items already persisted to avoid re-POSTing on subsequent saves
  const persistedDiagnosisCodesRef = useRef<Set<string>>(new Set());
  const persistedMedicineKeysRef = useRef<Set<string>>(new Set());
  // Tracks persisted items that the user removed, so the save can delete them.
  const removedDiagnosisIdsRef = useRef<Set<string>>(new Set());
  const removedMedicineIdsRef = useRef<Set<string>>(new Set());
  const {
    diagnosisSearch,
    setDiagnosisSearch,
    diagnosisOptions,
    medicineSearch,
    setMedicineSearch,
    medicineOptions,
  } = useVisitCatalogOptions(isReadOnly);
  // Diagnoses list
  const [diagnosesList, setDiagnosesList] = useState<DiagnosisItem[]>([]);
  // Medicines list
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([]);
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineFrequency, setMedicineFrequency] = useState('');
  const [medicineDuration, setMedicineDuration] = useState('');

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  // Load existing visit when visitId is in the URL.
  useEffect(() => {
    if (!visitId) return;
    let active = true;
    setIsLoadingVisit(true);
    getVisit(visitId).then(visitData => {
      if (!active) return;
      const visitDateObj = visitData.visitDate ? new Date(visitData.visitDate) : null;
      setVisitDate(visitDateObj ? visitDateObj.toLocaleDateString() : null);

      const { subjective: patientComplaints, diagnosis: diagnosisText, recommendations } = parseSummaryText(visitData.summary?.summaryText ?? '');
      setSubjective(patientComplaints);
      setDiagnosis(diagnosisText);
      setPlan(recommendations);

      if (visitData.patient?.user) {
        const patientUser = visitData.patient.user;
        const dateOfBirth = patientUser.birthDate ? new Date(patientUser.birthDate).toLocaleDateString('en-GB') : undefined;
        setPatientInfo({
          name: patientUser.fullName, phone: patientUser.phone, idNumber: visitData.patient.idNumber,
          dob: dateOfBirth, hmo: visitData.patient.hmo, bloodType: visitData.patient.bloodType,
        });
      }

      setBloodPressure(visitData.bloodPressure ?? '');
      setPulse(visitData.pulse ?? '');
      setBodyTemp(visitData.bodyTemp ?? '');
      setWeight(visitData.weight ?? '');
      setHeight(visitData.height ?? '');
      setOxygenSat(visitData.oxygenSat ?? '');
      setVisitType(visitData.visitType ?? '');
      setFollowUpDate(visitData.followUpDate ?? '');
      setReferralNotes(visitData.referralNotes ?? '');

      if (visitData.diagnoses && visitData.diagnoses.length > 0) {
        const loadedDiagnoses = visitData.diagnoses.map((diagEntry: VisitDiagnosisEntry) => ({
          code: diagEntry.diagnosis?.code ?? '',
          description: diagEntry.diagnosis?.description ?? '',
          diagnosisId: diagEntry.diagnosis?.id,
        }));
        setDiagnosesList(loadedDiagnoses);
        persistedDiagnosisCodesRef.current = new Set(loadedDiagnoses.map(d => d.code));
      }
      if (visitData.medicines && visitData.medicines.length > 0) {
        const loadedMedicines = visitData.medicines.map((medEntry: VisitMedicineEntry) => ({
          name: medEntry.medicine?.name ?? '',
          dosage: medEntry.dosage ?? '',
          frequency: medEntry.frequency ?? '',
          duration: medEntry.duration ?? '',
          instructions: medEntry.instructions,
          medicineId: medEntry.medicine?.id,
        }));
        setMedicinesList(loadedMedicines);
        persistedMedicineKeysRef.current = new Set(
          loadedMedicines.map(m => `${m.name}|${m.dosage}|${m.frequency}|${m.duration}`),
        );
      }
    }).catch((err: unknown) => {
      if (!active) return;
      setToast({
        severity: 'error',
        message: `Load error: ${getErrorMessage(err, 'Failed to load visit data.')}`,
      });
    }).finally(() => {
      if (active) setIsLoadingVisit(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  // Cancel the post-save navigation if the hook unmounts before it fires.
  useEffect(() => () => {
    if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
  }, []);

  const handleRecord = () => {
    if (isStarting) return;
    return isRecording ? stop() : start();
  };

  const handleAddMedicine = () => {
    const name = medicineSearch.trim();
    if (!name || !medicineDosage.trim() || !medicineFrequency.trim() || !medicineDuration.trim()) return;
    setMedicinesList(prev => [...prev, {
      name, dosage: medicineDosage.trim(), frequency: medicineFrequency.trim(), duration: medicineDuration.trim(),
    }]);
    setMedicineSearch(''); setMedicineDosage(''); setMedicineFrequency(''); setMedicineDuration('');
  };

  const removeDiagnosis = (index: number) =>
    setDiagnosesList(prev => {
      const item = prev[index];
      if (item?.diagnosisId) removedDiagnosisIdsRef.current.add(item.diagnosisId);
      return prev.filter((_, idx) => idx !== index);
    });
  const addDiagnosis = (item: DiagnosisItem) =>
    setDiagnosesList(prev => (prev.some(d => d.code === item.code) ? prev : [...prev, item]));
  const removeMedicine = (index: number) =>
    setMedicinesList(prev => {
      const item = prev[index];
      if (item?.medicineId) removedMedicineIdsRef.current.add(item.medicineId);
      return prev.filter((_, idx) => idx !== index);
    });

  const handleSave = async () => {
    // Guard against re-entrancy (fast double-clicks) and read-only callers.
    if (isReadOnly || isSavingRef.current) return;
    if (!patientId) {
      setToast({ severity: 'error', message: 'יש לבחור מטופל לפני שמירת ביקור.' });
      return;
    }

    const vitalsAndMeta = {
      bloodPressure: bloodPressure.trim() || undefined,
      pulse: pulse.trim() || undefined,
      bodyTemp: bodyTemp.trim() || undefined,
      weight: weight.trim() || undefined,
      height: height.trim() || undefined,
      oxygenSat: oxygenSat.trim() || undefined,
      visitType: visitType || undefined,
      followUpDate: followUpDate || undefined,
      referralNotes: referralNotes.trim() || undefined,
    };

    const summaryText = buildSummaryText(subjective, diagnosis, plan);

    // visitType and followUpDate are scheduling metadata — not clinical content.
    const hasContent =
      !!summaryText ||
      !!bloodPressure.trim() ||
      !!pulse.trim() ||
      !!bodyTemp.trim() ||
      !!weight.trim() ||
      !!height.trim() ||
      !!oxygenSat.trim() ||
      !!referralNotes.trim() ||
      diagnosesList.length > 0 ||
      medicinesList.length > 0;
    if (!hasContent) {
      setToast({ severity: 'error', message: 'לא ניתן לשמור ביקור ריק.' });
      return;
    }

    isSavingRef.current = true;
    setSaving(true);
    try {
      const existingId = visitId ?? createdVisitId;
      const targetId = existingId ?? (await createVisit({
        patientId,
        slotId,
        visitDate: new Date().toISOString(),
        ...vitalsAndMeta,
      })).id;
      if (!existingId) setCreatedVisitId(targetId);

      if (summaryText) {
        await upsertVisitSummary(targetId, {
          summaryText,
          visitType: transcript ? 'RECORDING' : 'MANUAL_INPUT',
        });
      }

      if (existingId) {
        await updateVisit(targetId, vitalsAndMeta);
      }

      for (const item of diagnosesList) {
        if (persistedDiagnosisCodesRef.current.has(item.code)) continue;
        await addVisitDiagnosis(targetId, { diagnosisCode: item.code, diagnosisDescription: item.description });
        persistedDiagnosisCodesRef.current.add(item.code);
      }
      for (const item of medicinesList) {
        const key = `${item.name}|${item.dosage}|${item.frequency}|${item.duration}`;
        if (persistedMedicineKeysRef.current.has(key)) continue;
        await addVisitMedicine(targetId, {
          medicineName: item.name, dosage: item.dosage, frequency: item.frequency,
          duration: item.duration, instructions: item.instructions,
        });
        persistedMedicineKeysRef.current.add(key);
      }
      // Delete items the user removed from the list.
      for (const diagnosisId of removedDiagnosisIdsRef.current) {
        await removeVisitDiagnosis(targetId, diagnosisId);
      }
      removedDiagnosisIdsRef.current.clear();
      for (const medicineId of removedMedicineIdsRef.current) {
        await removeVisitMedicine(targetId, medicineId);
      }
      removedMedicineIdsRef.current.clear();

      setToast({ severity: 'success', message: 'ביקור נשמר.' });
      navigateTimeoutRef.current = setTimeout(() => navigate('/patients'), 700);
    } catch (err: unknown) {
      setToast({ severity: 'error', message: getErrorMessage(err, 'שמירת ביקור נכשלה.') });
    } finally {
      isSavingRef.current = false;
      setSaving(false);
    }
  };

  // When the recorder summary arrives, seed the form fields.
  useEffect(() => {
    if (!summary) return;
    const { patientComplaints, diagnosis: diagText, doctorsRecommendations } = summary;
    const subjectiveText =
      (patientComplaints && patientComplaints !== 'Not documented.') ? patientComplaints : transcript;
    if (subjectiveText) {
      setSubjective(prev => prev || subjectiveText);
    }
    if (diagText && diagText !== 'Not documented.') setDiagnosis(prev => prev || diagText);
    if (doctorsRecommendations && doctorsRecommendations !== 'Not documented.') setPlan(prev => prev || doctorsRecommendations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  // Fallback: transcription succeeded but no summary.
  useEffect(() => {
    if (status !== 'done') return;
    if (!transcript && !summary) {
      setToast({ severity: 'error', message: 'תמלול נכשל. נסה שנית.' });
      return;
    }
    if (transcript && !summary) setSubjective(prev => prev || transcript);
  }, [status, transcript, summary]);

  return {
    navigate,
    isReadOnly, isLoadingVisit, isRecording, isProcessing, isStarting,
    visitDate, timer, saving, toast, setToast, patientInfo,
    // text fields
    subjective, setSubjective, diagnosis, setDiagnosis, plan, setPlan,
    // vitals
    bloodPressure, setBloodPressure, pulse, setPulse, bodyTemp, setBodyTemp,
    weight, setWeight, height, setHeight, oxygenSat, setOxygenSat,
    // metadata
    visitType, setVisitType, followUpDate, setFollowUpDate, referralNotes, setReferralNotes,
    // diagnoses
    diagnosesList, diagnosisSearch, setDiagnosisSearch, diagnosisOptions, addDiagnosis, removeDiagnosis,
    // medicines
    medicinesList, medicineSearch, setMedicineSearch, medicineOptions,
    medicineDosage, setMedicineDosage, medicineFrequency, setMedicineFrequency,
    medicineDuration, setMedicineDuration, handleAddMedicine, removeMedicine,
    // actions
    handleRecord, handleSave, cancel,
  };
}

export type VisitFormState = ReturnType<typeof useVisitForm>;
