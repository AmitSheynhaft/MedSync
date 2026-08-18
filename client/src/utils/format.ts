export const getGenderLabel = (gender?: string): string => {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'זכר';
  if (g === 'female') return 'נקבה';
  return gender ?? '';
};


export const formatSlotDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const todayISO = (): string => {
  const d = new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const currentTimeHM = (): string => {
  const d = new Date();
  return `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;
};

export const isPastDateTime = (date: string, time: string): boolean => {
  if (!date || !time) return false;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const slot = new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
  return slot + 60_000 < Date.now();
};
