export function parseSummaryText(raw: string) {
  const normalizedText = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const extractSection = (sectionLabel: string) => {
    const escapedLabel = sectionLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escapedLabel}:\\n([\\s\\S]*?)(?=\\n\\n[^\\n]+:\\n|$)`);
    return pattern.exec(normalizedText)?.[1]?.trim() ?? '';
  };

  const patientComplaints = extractSection('Patient Complaints');
  const diagnosisText = extractSection('Diagnosis');
  const recommendations = extractSection("Doctor's Recommendations");

  const subjective = (!patientComplaints && !diagnosisText && !recommendations && normalizedText)
    ? normalizedText
    : patientComplaints;

  return { subjective, diagnosis: diagnosisText, recommendations };
}

export function buildSummaryText(
  patientComplaints: string,
  diagnosis: string,
  doctorRecommendations: string,
): string {
  const sections: string[] = [];
  if (patientComplaints.trim()) sections.push(`Patient Complaints:\n${patientComplaints.trim()}`);
  if (diagnosis.trim()) sections.push(`Diagnosis:\n${diagnosis.trim()}`);
  if (doctorRecommendations.trim()) sections.push(`Doctor's Recommendations:\n${doctorRecommendations.trim()}`);
  return sections.join('\n\n');
}
