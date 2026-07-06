import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { getEffectiveRole } from '../../../auth/viewAs';
import { Role } from '../../../constants/roles';
import {
  createVisit, upsertVisitSummary,
  addVisitDiagnosis, addVisitMedicine, updateVisit, getVisit,
} from '../../../api/visits';
import { getDiagnoses, Diagnosis } from '../../../api/diagnoses';
import { getMedicines, Medicine } from '../../../api/medicines';
import { ToastState, DiagnosisItem, MedicineItem, PatientInfo } from '../constants';
import { parseSummaryText, buildSummaryText } from '../utils';


function isDateInPast(dateString: string | null): boolean {
  if (!dateString) return false;
  
  try {
    const visitDate = new Date(dateString);
    visitDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return visitDate < today;
  } catch {
    return false;
  }
}

export function useVisitForm() {
  const navigate = useNavigate();
  const { id: patientId, visitId } = useParams<{ id: string; visitId: string }>();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId') ?? undefined;
  const { status, isStarting, transcript, summary, timer, start, stop } = useAudioRecorder();

  const [subjective, setSubjective] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);
  // Determine if the form should be read-only based on role and visit date
  const [visitDateObj, setVisitDateObj] = useState<Date | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(() => getEffectiveRole() !== Role.Doctor);
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [isLoadingVisit, setIsLoadingVisit] = useState(false);
  // Tracks the visit created in this session so a second save updates it
  // instead of creating a duplicate (the page no longer navigates away on save).
  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
  const isSavingRef = useRef(false);
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
  const [followUpDate, setFollowUpDate] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  // Diagnoses list
  const [diagnosesList, setDiagnosesList] = useState<DiagnosisItem[]>([]);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState<Diagnosis[]>([]);
  // Medicines list
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineFrequency, setMedicineFrequency] = useState('');
  const [medicineDuration, setMedicineDuration] = useState('');

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  // Pre-load catalog options for the editing dropdowns. These are doctor-only
  // endpoints, so skip them in read-only (patient) mode to avoid 403s.
  useEffect(() => {
    if (isReadOnly) return;
    getDiagnoses().then(res => setDiagnosisOptions(res.slice(0, 30))).catch(() => {});
    getMedicines().then(res => setMedicineOptions(res.slice(0, 30))).catch(() => {});
  }, [isReadOnly]);

  // Debounced diagnosis search.
  useEffect(() => {
    if (isReadOnly || !diagnosisSearch.trim()) return;
    const debounceTimer = window.setTimeout(() => {
      getDiagnoses(diagnosisSearch).then(res => setDiagnosisOptions(res.slice(0, 10))).catch(() => {});
    }, 250);
    return () => window.clearTimeout(debounceTimer);
  }, [diagnosisSearch, isReadOnly]);

  // Debounced medicine search.
  useEffect(() => {
    if (isReadOnly || !medicineSearch.trim()) return;
    const debounceTimer = window.setTimeout(() => {
      getMedicines(medicineSearch).then(res => setMedicineOptions(res.slice(0, 10))).catch(() => {});
    }, 250);
    return () => window.clearTimeout(debounceTimer);
  }, [medicineSearch, isReadOnly]);

  // Load existing visit when visitId is in the URL.
  useEffect(() => {
    if (!visitId) return;
    let active = true;
    setIsLoadingVisit(true);
    getVisit(visitId).then(visitData => {
      if (!active) return;
      const visitDateObj = visitData.visitDate ? new Date(visitData.visitDate) : null;
      setVisitDateObj(visitDateObj);
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
        setDiagnosesList(visitData.diagnoses.map((diagEntry: any) => ({
          code: diagEntry.diagnosis?.code ?? '',
          description: diagEntry.diagnosis?.description ?? '',
        })));
      }
      if (visitData.medicines && visitData.medicines.length > 0) {
        setMedicinesList(visitData.medicines.map((medEntry: any) => ({
          name: medEntry.medicine?.name ?? '',
          dosage: medEntry.dosage ?? '',
          frequency: medEntry.frequency ?? '',
          duration: medEntry.duration ?? '',
          instructions: medEntry.instructions,
        })));
      }
    }).catch((err: any) => {
      if (!active) return;
      setToast({ severity: 'error', message: `Load error: ${err?.message || 'Failed to load visit data.'}` });
    }).finally(() => {
      if (active) setIsLoadingVisit(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  useEffect(() => {
    const userIsDoctor = getEffectiveRole() === Role.Doctor;
    const visitIsPast = visitDateObj && isDateInPast(visitDateObj.toISOString());
    
    setIsReadOnly(!userIsDoctor || !!visitIsPast);
  }, [visitDateObj]);

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
    setDiagnosesList(prev => prev.filter((_, idx) => idx !== index));
  const addDiagnosis = (item: DiagnosisItem) =>
    setDiagnosesList(prev => (prev.some(d => d.code === item.code) ? prev : [...prev, item]));
  const removeMedicine = (index: number) =>
    setMedicinesList(prev => prev.filter((_, idx) => idx !== index));

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

    // Refuse to create an empty record: require at least a summary, some
    // vitals/metadata, a diagnosis or a medicine.
    const hasContent =
      !!summaryText ||
      Object.values(vitalsAndMeta).some(v => v !== undefined) ||
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
        await addVisitDiagnosis(targetId, { diagnosisCode: item.code, diagnosisDescription: item.description });
      }
      for (const item of medicinesList) {
        await addVisitMedicine(targetId, {
          medicineName: item.name, dosage: item.dosage, frequency: item.frequency,
          duration: item.duration, instructions: item.instructions,
        });
      }

      setToast({ severity: 'success', message: 'ביקור נשמר.' });
      window.setTimeout(() => navigate('/patients'), 700);
    } catch (err: any) {
      setToast({ severity: 'error', message: err?.message || 'שמירת ביקור נכשלה.' });
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
    handleRecord, handleSave,
  };
}

export type VisitFormState = ReturnType<typeof useVisitForm>;
