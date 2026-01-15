# ☕ Calendar Booking System - Setup Guide

## 🎉 What's New

Your portfolio now has a **professional calendar booking system** that makes it super easy for recruiters and potential collaborators to schedule time with you!

---

## ✨ Features Included

### 1. **Beautiful Calendar Interface**
- Next 10 business days displayed
- Available time slots: 9 AM - 5 PM (skips lunch at 12 PM)
- Timezone-aware (shows user's local timezone)
- Smooth animations and transitions

### 2. **Two Contact Options**
When someone clicks "Connect", they see:
- **"Schedule a Coffee Chat"** → Opens full calendar booking
- **"Send a Quick Email"** → Direct mailto link

### 3. **Booking Form**
Collects all the important info:
- Name & Email (required)
- Company & Role (optional)
- Reason for chat (dropdown with options)
- Custom message (optional)

### 4. **Booking Reasons**
Pre-defined options:
- Job Opportunity
- Collaboration
- Consulting / Freelance
- Mentorship
- General Chat
- Other

### 5. **Success Confirmation**
After booking:
- Animated checkmark
- Shows booking details
- Explains next steps
- Option to book another time

---

## 🚀 How It Works (User Flow)

1. **User clicks "Connect" in navigation** → Opens modal
2. **Sees two options**: Schedule chat OR quick email
3. **Clicks "Schedule a Coffee Chat"** → Calendar appears
4. **Selects a date** from available days
5. **Picks a time slot** from that day
6. **Fills in their details** (name, email, etc.)
7. **Submits booking** → See success animation
8. **Gets confirmation** with meeting details

---

## 📧 Setting Up Email Notifications

Currently, bookings are logged to console. To get actual notifications:

### Option A: Use a Backend API (Recommended)

1. **Create an API endpoint** (e.g., `/api/book-meeting`)
2. **Update** `/lib/calendar.ts` → `submitBooking()` function:

```typescript
export async function submitBooking(data: BookingData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/book-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, message: 'Booking failed' };
  }
}
```

3. **In your API**, send emails using:
   - SendGrid
   - Resend
   - Nodemailer
   - AWS SES

### Option B: Use Calendly Integration

Replace the calendar with Calendly embed:

```tsx
<iframe
  src="https://calendly.com/your-username"
  width="100%"
  height="700px"
  frameBorder="0"
/>
```

### Option C: Use Google Calendar API

1. Set up Google Calendar API
2. Create calendar events programmatically
3. Send invites automatically

### Option D: Email Form Service

Use services like:
- **Formspree** (free tier available)
- **EmailJS** (client-side emails)
- **Getform.io**

Example with Formspree:

```typescript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' }
});
```

---

## ⚙️ Customization

### Update Your Email
`/components/cards/ContactCard.tsx` line 13:
```typescript
window.location.href = "mailto:your-actual-email@example.com";
```

### Change Available Hours
`/lib/calendar.ts` line 38:
```typescript
const hours = [9, 10, 11, 13, 14, 15, 16]; // Customize this array
```

### Add/Remove Days
`/lib/calendar.ts` line 19:
```typescript
export function getNextDays(count: number = 14) // Change default count
```

### Modify Time Slots
Currently: 1-hour slots starting on the hour
To add 30-min slots:

```typescript
const hours = [9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5];
```

Then update `formatTime()` to handle decimals.

### Update Stats
`/components/cards/ContactCard.tsx` lines 186-204:
```typescript
<div className="text-2xl font-black text-neonPink">24h</div> {/* Your response time */}
<div className="text-2xl font-black text-electricPurple">100%</div> {/* Your reply rate */}
```

### Change Booking Reasons
`/lib/calendar.ts` lines 79-86:
```typescript
export const bookingReasons = [
  { value: 'your-reason', label: 'Your Custom Reason' },
  // Add more...
];
```

---

## 🎨 Design Details

### Colors Used
- **Gradient button**: neonPink → electricPurple → skyBlue
- **Selected date**: Gradient background
- **Selected time**: skyBlue
- **Success**: limeGreen → skyBlue

### Animations
- Smooth fade in/out when switching views
- Scale animations on buttons
- Staggered appearance of date/time options
- Spring animation on success checkmark

### Responsive
- Desktop: Full side-by-side layout
- Mobile: Stacked layout
- Works on all screen sizes

---

## 📊 What Gets Collected

When someone books:
```typescript
{
  name: "John Doe",
  email: "john@company.com",
  company: "Acme Corp",
  role: "Engineering Manager",
  date: "Tue, Jan 14",
  time: "2:00 PM",
  message: "Interested in discussing the Senior Dev role"
}
```

---

## 🔒 Privacy & GDPR

Current setup:
- Data only sent to your backend (you control it)
- No third-party tracking
- User consent implied by form submission

**Recommended additions:**
- Add privacy policy link
- Add "By booking, you agree to..." text
- Store data securely
- Provide way to cancel/modify bookings

---

## 🚀 Production Checklist

Before going live:

- [ ] Update email address in ContactCard
- [ ] Set up backend API for booking submissions
- [ ] Configure email service (SendGrid/Resend/etc.)
- [ ] Test booking flow end-to-end
- [ ] Add calendar invite generation
- [ ] Set up email confirmations
- [ ] Add booking to your actual calendar
- [ ] Test on mobile devices
- [ ] Add error handling
- [ ] Set up analytics tracking (optional)

---

## 💡 Pro Tips

1. **Block out unavailable times**: Modify `getTimeSlotsForDate()` to check against your actual calendar

2. **Prevent double-booking**: Store bookings in database and mark slots as unavailable

3. **Send reminders**: Set up automated reminders 24h before meeting

4. **Add buffer time**: Block 15 min before/after each meeting

5. **Timezone handling**: Currently shows user's local time - consider adding your timezone too

6. **Cancellation link**: Include cancellation link in confirmation email

7. **Recurring availability**: Instead of hardcoded hours, pull from your calendar's working hours

---

## 🎯 Impact on Your Portfolio

**Before**: Contact button just opened email
**After**: Professional booking system that:
- ✅ Reduces friction (no back-and-forth emails)
- ✅ Shows you're organized and professional
- ✅ Makes it easy for recruiters to connect
- ✅ Increases chance of actual interviews
- ✅ Stands out from typical portfolios

**Expected result**: More meeting bookings = More opportunities!

---

## 📱 Live Demo

1. Refresh your page: http://localhost:3000
2. Click "Connect" in bottom navigation
3. Click "Schedule a Coffee Chat"
4. Pick a date and time
5. Fill in the form
6. See the success animation!

---

## 🛠️ Files Created/Modified

### New Files:
- `/lib/calendar.ts` - Calendar logic and utilities
- `/components/CalendarBooking.tsx` - Calendar UI component
- `/CALENDAR_BOOKING_SETUP.md` - This guide

### Modified Files:
- `/components/cards/ContactCard.tsx` - Added calendar integration

---

## 🔧 Quick Integration Examples

### Example: Send Email via Formspree

1. Sign up at https://formspree.io
2. Get your form endpoint
3. Update `/lib/calendar.ts`:

```typescript
export async function submitBooking(data: BookingData) {
  const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  });

  if (response.ok) {
    return { success: true, message: 'Meeting booked!' };
  } else {
    return { success: false, message: 'Failed to book' };
  }
}
```

### Example: Log to Google Sheets

Use a service like https://sheet.best to turn a Google Sheet into an API.

---

## 🎉 What's Next?

Want to make it even better?

1. **Google Calendar sync** - Auto-add to your calendar
2. **Video call links** - Auto-generate Zoom/Meet links
3. **Reminder emails** - Send 1 day before meeting
4. **Rescheduling** - Let people change meeting time
5. **Admin dashboard** - See all bookings in one place

---

Need help setting any of this up? Just ask! 🚀
