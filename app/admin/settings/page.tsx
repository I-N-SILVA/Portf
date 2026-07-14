import { getAvailability, formatTime, WEEKDAYS } from "@/lib/os/bookings";
import {
  AddAvailabilityForm,
  RemoveAvailabilityButton,
} from "./AvailabilityAdmin";

export const metadata = { title: "Settings — Shaft OS Admin" };

export default async function AdminSettings() {
  const windows = await getAvailability();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · settings</p>
      <h1 className="os-title">Settings</h1>
      <p className="os-sub">
        Business-wide configuration. For now: the availability windows clients
        see when requesting a session.
      </p>

      <div className="os-sec">Booking availability</div>
      <AddAvailabilityForm />

      <div className="os-tablewrap" style={{ marginTop: "8px" }}>
        <table className="os-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>From</th>
              <th>To</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {windows.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={4}>
                  No availability set — clients can still request any time.
                </td>
              </tr>
            ) : (
              windows.map((w) => (
                <tr key={w.id}>
                  <td style={{ color: "var(--os-ink)" }}>{WEEKDAYS[w.weekday]}</td>
                  <td>{formatTime(w.start_time)}</td>
                  <td>{formatTime(w.end_time)}</td>
                  <td style={{ textAlign: "right" }}>
                    <RemoveAvailabilityButton id={w.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
