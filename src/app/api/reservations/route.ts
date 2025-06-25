import { NextRequest, NextResponse } from 'next/server';
import { getReservations, addReservation } from '@/lib/db';

export function GET() {
  const reservations = getReservations();
  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  const { room_id, user_name, start_time, end_time } = await req.json();
  const reservation = addReservation(Number(room_id), user_name, start_time, end_time);
  return NextResponse.json(reservation, { status: 201 });
}
