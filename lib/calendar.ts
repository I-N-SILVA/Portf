// Calendar booking system

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date: Date;
}

export interface BookingData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  date: string;
  time: string;
  message?: string;
}

// Generate next 14 days
export function getNextDays(count: number = 14): Date[] {
  const days: Date[] = [];
  const today = new Date();

  for (let i = 1; i <= count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date);
    }
  }

  return days.slice(0, count);
}

// Generate time slots for a given date
export function getTimeSlotsForDate(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Available hours: 9 AM - 5 PM
  const hours = [9, 10, 11, 13, 14, 15, 16]; // Skip 12 for lunch

  hours.forEach((hour) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);

    slots.push({
      id: `${date.toISOString().split('T')[0]}-${hour}`,
      time: formatTime(hour),
      available: true, // In real app, check against booked slots
      date: slotDate,
    });
  });

  return slots;
}

// Format time to 12-hour format
function formatTime(hour: number): string {
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}

// Format date for display
export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

// Format full date and time
export function formatDateTime(date: Date, time: string): string {
  return `${formatDate(date)} at ${time}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Submit booking (in a real app, this would call an API)
export async function submitBooking(data: BookingData): Promise<{ success: boolean; message: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In production, this would:
  // 1. Send email notification to you
  // 2. Add to your calendar (Google Calendar API)
  // 3. Send confirmation email to them
  // 4. Store in database

  console.log('Booking submitted:', data);

  // For now, just return success
  // You can replace this with actual API call to your backend
  return {
    success: true,
    message: `Meeting booked for ${data.date} at ${data.time}!`,
  };
}

// Get timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Booking reasons (for dropdown)
export const bookingReasons = [
  { value: 'job-opportunity', label: 'Job Opportunity' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'consulting', label: 'Consulting / Freelance' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'general', label: 'General Chat' },
  { value: 'other', label: 'Other' },
];

// Default availability note
export const availabilityNote =
  "All times are in your local timezone. I'll send a calendar invite with video call link after booking.";
