import { useState, useEffect } from "react";
import { loadUserDataSession } from "../../../auth/userDataSessionStore";
import { uploadDocument } from "../../../api/documents";
import { DocumentTypeEnum } from "../../../api/medical-documents";
import { PatientDocument, Patient, Encounter, getPatientById } from "../../../api/patients";

export type ToastState = {
  severity: "success" | "error";
  message: string;
} | null;

export type PendingDoc = {
  id: string;
  name: string;
  date: string | null;
  status: "processing";
  kind: "image" | "pdf";
};

export type DashboardDoc = PatientDocument | PendingDoc;

function docKind(name: string): "image" | "pdf" {
  return /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(name) ? "image" : "pdf";
}

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

export function usePatientDashboard() {
  const userDataSession = loadUserDataSession();
  const patientId = userDataSession?.patientId;
  const userName = userDataSession?.fullName || "Patient";
  const userInitials = initialsFromName(userName);
  const firstName = userName.split(" ")[0];

  const [patient, setPatient] = useState<Patient | null>(null);
  const [documents, setDocuments] = useState<DashboardDoc[]>([]);
  const [visits, setVisits] = useState<Encounter[]>([]);
  const [loadingData, setLoadingData] = useState(Boolean(patientId));
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!patientId) {
      setLoadingData(false);
      return;
    }

    let active = true;
    setLoadingData(true);

    getPatientById(patientId)
      .then((p) => {
        if (!active) return;
        setPatient(p);
        setDocuments(p.documents || []);
        setVisits(p.encounters || []);
      })
      .catch(() => {
        if (active)
          setToast({ severity: "error", message: "Failed to load your data." });
      })
      .finally(() => {
        if (active) setLoadingData(false);
      });

    return () => {
      active = false;
    };
  }, [patientId]);

  const refreshDocuments = async () => {
    if (!patientId) return;
    try {
      const p = await getPatientById(patientId);
      setDocuments(p.documents || []);
    } catch {
      /* ignore — list will refresh on next successful load */
    }
  };

  const uploadFile = async (file: File, documentType?: DocumentTypeEnum) => {
    setUploading(true);
    const placeholder: PendingDoc = {
      id: `pending-${Date.now()}`,
      name: file.name,
      date: null,
      status: "processing",
      kind: docKind(file.name),
    };
    setDocuments((prev) => [placeholder, ...prev]);
    try {
      await uploadDocument(file, patientId, documentType);
      setToast({
        severity: "success",
        message: `"${file.name}" uploaded successfully.`,
      });
      await refreshDocuments();
    } catch {
      setDocuments((prev) => prev.filter((d) => d.id !== placeholder.id));
      setToast({
        severity: "error",
        message: `Failed to upload "${file.name}". Please try again.`,
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    patientId,
    userName,
    userInitials,
    firstName,
    patient,
    documents,
    visits,
    loadingData,
    uploading,
    toast,
    setToast,
    uploadFile,
  };
}
