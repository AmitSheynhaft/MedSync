export const getGenderLabel = (gender?: string): string => {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'זכר';
  if (g === 'female') return 'נקבה';
  return gender ?? '';
};
