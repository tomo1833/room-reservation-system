'use client';
import { useEffect, useState } from 'react';

interface Reservation {
  reservation_id: number;
  room_id: number;
  user_name: string;
  start_time: string;
  end_time: string;
  deleted: number;
}

export default function ReservationApp() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState({ room_id: '', user_name: '', start_time: '', end_time: '' });

  const fetchReservations = async () => {
    const res = await fetch('/api/reservations');
    const data = await res.json();
    setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: parseInt(form.room_id),
        user_name: form.user_name,
        start_time: form.start_time,
        end_time: form.end_time,
      }),
    });
    setForm({ room_id: '', user_name: '', start_time: '', end_time: '' });
    fetchReservations();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs">
        <input
          type="number"
          placeholder="Room ID"
          value={form.room_id}
          onChange={(e) => setForm({ ...form, room_id: e.target.value })}
          className="border p-1"
        />
        <input
          type="text"
          placeholder="User"
          value={form.user_name}
          onChange={(e) => setForm({ ...form, user_name: e.target.value })}
          className="border p-1"
        />
        <input
          type="datetime-local"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          className="border p-1"
        />
        <input
          type="datetime-local"
          value={form.end_time}
          onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          className="border p-1"
        />
        <button type="submit" className="bg-blue-600 text-white p-2">
          Add Reservation
        </button>
      </form>
      <Timeline reservations={reservations} />
      <ul className="border-t pt-2 text-sm">
        {reservations.map((r) => (
          <li key={r.reservation_id}>
            #{r.reservation_id} Room {r.room_id} {r.user_name} {r.start_time} -{' '}
            {r.end_time}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Timeline({ reservations }: { reservations: Reservation[] }) {
  const rooms = Array.from(new Set(reservations.map((r) => r.room_id)));
  return (
    <div className="space-y-4 w-full max-w-3xl">
      {rooms.map((roomId) => {
        const roomReservations = reservations.filter((r) => r.room_id === roomId);
        return (
          <div key={roomId}>
            <div className="text-sm mb-1">Room {roomId}</div>
            <div className="relative h-6 border w-full bg-gray-100">
              {roomReservations.map((r) => {
                const start = new Date(r.start_time);
                const end = new Date(r.end_time);
                const startPct =
                  ((start.getHours() + start.getMinutes() / 60) / 24) * 100;
                const endPct = ((end.getHours() + end.getMinutes() / 60) / 24) * 100;
                return (
                  <div
                    key={r.reservation_id}
                    className="absolute top-0 h-full bg-blue-500 text-white text-[10px] overflow-hidden whitespace-nowrap px-1"
                    style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                  >
                    {r.user_name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
