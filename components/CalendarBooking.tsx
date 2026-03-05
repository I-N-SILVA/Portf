"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  getNextDays,
  getTimeSlotsForDate,
  formatDate,
  formatDateTime,
  isValidEmail,
  submitBooking,
  getUserTimezone,
  bookingReasons,
  availabilityNote,
  type TimeSlot,
  type BookingData,
} from "@/lib/calendar";
import { CALENDAR } from "@/lib/constants";
import { playSound } from "@/lib/sounds";

export default function CalendarBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    reason: "job-opportunity",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState("");
  const [validationError, setValidationError] = useState("");

  const availableDays = getNextDays(CALENDAR.AVAILABILITY_DAYS);

  const handleDateSelect = (date: Date) => {
    playSound("hover");
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowForm(false);
    setValidationError("");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    playSound("pickup");
    setSelectedSlot(slot);
    setShowForm(true);
    setValidationError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setValidationError("Please fill in your name and email.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!selectedSlot || !selectedDate) return;

    setIsSubmitting(true);
    playSound("flip");

    const bookingData: BookingData = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      role: formData.role,
      date: formatDate(selectedDate),
      time: selectedSlot.time,
      message: formData.message,
    };

    try {
      const result = await submitBooking(bookingData);
      if (result.success) {
        setIsBooked(true);
        setBookingConfirmation(formatDateTime(selectedDate, selectedSlot.time));
        playSound("drop");
      }
    } catch {
      setValidationError("Booking failed. Please try again or email directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];

  if (isBooked) {
    return (
      <motion.div
        className="glass-dark rounded-3xl p-8 max-w-2xl mx-auto text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        role="status"
        aria-live="polite"
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sky-primary to-sky-secondary flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2 className="text-3xl font-black text-sky-text-primary mb-4" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          Coffee Chat Booked!
        </motion.h2>

        <motion.p className="text-sky-text-secondary mb-2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          Looking forward to our chat on
        </motion.p>

        <motion.p className="text-2xl font-bold text-sky-primary mb-6" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
          {bookingConfirmation}
        </motion.p>

        <motion.div className="space-y-3 text-sm text-sky-text-secondary/70" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
          <p>Calendar invite sent to {formData.email}</p>
          <p>Video call link included</p>
          <p>Reminder 1 day before</p>
        </motion.div>

        <motion.button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-sky-primary text-white font-bold rounded-full hover:bg-sky-primary/80 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Book Another Time
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="glass-dark rounded-3xl p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-black text-sky-text-primary mb-2">Let&apos;s Connect</h2>
        <p className="text-sky-text-secondary text-sm">{availabilityNote}</p>
        <p className="text-xs text-sky-text-secondary/60 mt-2">Timezone: {getUserTimezone()}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Date Selection */}
        <div>
          <h3 className="text-lg font-bold text-sky-text-primary mb-4">Select a Day</h3>
          <div className="space-y-2">
            {availableDays.map((date, index) => (
              <motion.button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? "bg-sky-primary text-white"
                    : "bg-white/5 text-sky-text-secondary hover:bg-white/10"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-bold">{formatDate(date)}</div>
                <div className="text-xs opacity-75">
                  {selectedDate?.toDateString() === date.toDateString()
                    ? `${timeSlots.filter((s) => s.available).length} slots available`
                    : "Available"}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right: Time Slots or Form */}
        <div>
          {!selectedDate ? (
            <div className="h-full flex items-center justify-center text-sky-text-secondary/50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Select a date to see available times</p>
              </div>
            </div>
          ) : !showForm ? (
            <>
              <h3 className="text-lg font-bold text-sky-text-primary mb-4">Pick a Time</h3>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <motion.button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      selectedSlot?.id === slot.id
                        ? "bg-sky-primary text-white"
                        : slot.available
                        ? "bg-white/10 text-sky-text-secondary hover:bg-white/20"
                        : "bg-white/5 text-sky-text-secondary/40 cursor-not-allowed"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={slot.available ? { scale: 1.05 } : {}}
                    whileTap={slot.available ? { scale: 0.95 } : {}}
                  >
                    {slot.time}
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              noValidate
            >
              <h3 className="text-lg font-bold text-sky-text-primary mb-4">Your Details</h3>

              {/* Inline validation error */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold"
                  >
                    {validationError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="booking-name" className="block text-sm font-semibold text-sky-text-secondary mb-2">
                  Name <span className="text-sky-primary" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="booking-email" className="block text-sm font-semibold text-sky-text-secondary mb-2">
                  Email <span className="text-sky-primary" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-company" className="block text-sm font-semibold text-sky-text-secondary mb-2">Company</label>
                  <input
                    id="booking-company"
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label htmlFor="booking-role" className="block text-sm font-semibold text-sky-text-secondary mb-2">Your Role</label>
                  <input
                    id="booking-role"
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-reason" className="block text-sm font-semibold text-sky-text-secondary mb-2">Reason for Chat</label>
                <select
                  id="booking-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors"
                >
                  {bookingReasons.map((reason) => (
                    <option key={reason.value} value={reason.value} className="bg-gray-900">
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="booking-message" className="block text-sm font-semibold text-sky-text-secondary mb-2">
                  Message <span className="text-xs text-sky-text-secondary/40">(Optional)</span>
                </label>
                <textarea
                  id="booking-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-sky-text-primary border border-white/20 focus:border-sky-primary focus:outline-none focus:ring-2 focus:ring-sky-primary/30 transition-colors resize-none"
                  placeholder="Anything you'd like me to know?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={() => { setShowForm(false); setValidationError(""); }}
                  className="flex-1 px-6 py-3 rounded-full bg-white/10 text-sky-text-primary font-bold hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-primary/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-full bg-sky-primary text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-primary/50"
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </motion.button>
              </div>

              <div className="text-xs text-sky-text-secondary/40 text-center pt-2">
                Selected: {selectedDate && selectedSlot && formatDateTime(selectedDate, selectedSlot.time)}
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
