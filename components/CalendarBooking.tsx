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

  const availableDays = getNextDays(10); // Next 10 business days

  const handleDateSelect = (date: Date) => {
    playSound("hover");
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    playSound("pickup");
    setSelectedSlot(slot);
    setShowForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email) {
      alert("Please fill in required fields");
      return;
    }

    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email");
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
    } catch (error) {
      alert("Booking failed. Please try again or email directly.");
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
      >
        {/* Success animation */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-limeGreen to-skyBlue flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2
          className="text-3xl font-black text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Coffee Chat Booked! ☕
        </motion.h2>

        <motion.p
          className="text-gray-300 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Looking forward to our chat on
        </motion.p>

        <motion.p
          className="text-2xl font-bold text-neonPink mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {bookingConfirmation}
        </motion.p>

        <motion.div
          className="space-y-3 text-sm text-gray-400"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>✉️ Calendar invite sent to {formData.email}</p>
          <p>🎥 Video call link included</p>
          <p>⏰ Reminder 1 day before</p>
        </motion.div>

        <motion.button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-neonPink to-electricPurple text-white font-bold rounded-full"
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
        <h2 className="text-4xl font-black text-white mb-2">Let's Grab Coffee ☕</h2>
        <p className="text-gray-400 text-sm">{availabilityNote}</p>
        <p className="text-xs text-gray-500 mt-2">Timezone: {getUserTimezone()}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Date Selection */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Select a Day</h3>
          <div className="space-y-2">
            {availableDays.map((date, index) => (
              <motion.button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? "bg-gradient-to-r from-neonPink to-electricPurple text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
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
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p>Select a date to see available times</p>
              </div>
            </div>
          ) : !showForm ? (
            <>
              <h3 className="text-lg font-bold text-white mb-4">Pick a Time</h3>
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <motion.button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      selectedSlot?.id === slot.id
                        ? "bg-skyBlue text-white"
                        : slot.available
                        ? "bg-white/10 text-gray-300 hover:bg-white/20"
                        : "bg-white/5 text-gray-600 cursor-not-allowed"
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
            >
              <h3 className="text-lg font-bold text-white mb-4">Your Details</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Name <span className="text-neonPink">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-neonPink focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email <span className="text-neonPink">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-neonPink focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-skyBlue focus:outline-none transition-colors"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Your Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-skyBlue focus:outline-none transition-colors"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Reason for Chat</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-electricPurple focus:outline-none transition-colors"
                >
                  {bookingReasons.map((reason) => (
                    <option key={reason.value} value={reason.value} className="bg-deepBlack">
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Message <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-limeGreen focus:outline-none transition-colors resize-none"
                  placeholder="Anything you'd like me to know?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 rounded-full bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-neonPink via-electricPurple to-skyBlue text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </motion.button>
              </div>

              <div className="text-xs text-gray-500 text-center pt-2">
                Selected: {selectedDate && selectedSlot && formatDateTime(selectedDate, selectedSlot.time)}
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
}
