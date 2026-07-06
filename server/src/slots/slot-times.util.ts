import { BadRequestException } from '@nestjs/common';

export const SLOT_START_HOUR = 8;
export const SLOT_END_HOUR = 17;
export const SLOT_DURATION_MINUTES = 30;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export function buildSlotTime(date: string, time: string): Date {
  if (!DATE_PATTERN.test(date)) {
    throw new BadRequestException('date must be in YYYY-MM-DD format');
  }
  if (!TIME_PATTERN.test(time)) {
    throw new BadRequestException('time must be in HH:mm format');
  }
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const built = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(built.getTime())) {
    throw new BadRequestException('Invalid slot date or time');
  }
  return built;
}

export function assertValidSlotTime(slotTime: Date): void {
  const minutes = slotTime.getMinutes();
  if (minutes !== 0 && minutes !== 30) {
    throw new BadRequestException('Slots must start on a 30-minute boundary');
  }
  const minutesOfDay = slotTime.getHours() * 60 + minutes;
  const openMinutes = SLOT_START_HOUR * 60;
  const closeMinutes = SLOT_END_HOUR * 60;
  if (
    minutesOfDay < openMinutes ||
    minutesOfDay + SLOT_DURATION_MINUTES > closeMinutes
  ) {
    throw new BadRequestException(
      `Slots are available between ${pad(SLOT_START_HOUR)}:00 and ${pad(
        SLOT_END_HOUR,
      )}:00`,
    );
  }
}

export function assertSlotNotInPast(slotTime: Date, now: Date = new Date()): void {
  const tolerance = 60_000;
  if (slotTime.getTime() + tolerance < now.getTime()) {
    throw new BadRequestException('לא ניתן לקבוע תור לתאריך או שעה שכבר עברו');
  }
}

export function generateDailySlotTimes(): string[] {
  const times: string[] = [];
  const closeMinutes = SLOT_END_HOUR * 60;
  for (
    let minutes = SLOT_START_HOUR * 60;
    minutes + SLOT_DURATION_MINUTES <= closeMinutes;
    minutes += SLOT_DURATION_MINUTES
  ) {
    times.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  }
  return times;
}

export function getDayBounds(date: string): { start: Date; end: Date } {
  if (!DATE_PATTERN.test(date)) {
    throw new BadRequestException('date must be in YYYY-MM-DD format');
  }
  const [year, month, day] = date.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { start, end };
}

export function formatDatePart(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTimePart(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
