import { spawnSync } from 'child_process';
import { join } from 'path';

const DB_FILE = join(process.cwd(), 'reservation.db');

function runSql(sql: string, opts: { json?: boolean } = {}) {
  const args = [DB_FILE];
  if (opts.json) args.push('-json');
  const result = spawnSync('sqlite3', args, { input: sql, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr);
  }
  if (opts.json) {
    return result.stdout ? JSON.parse(result.stdout) : [];
  }
  return result.stdout;
}

export function initialize() {
  runSql(`CREATE TABLE IF NOT EXISTS room_reservation (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    deleted INTEGER DEFAULT 0
  );`);
}

export function getReservations() {
  initialize();
  return runSql('SELECT * FROM room_reservation WHERE deleted = 0 ORDER BY start_time;', { json: true });
}

export function addReservation(roomId: number, userName: string, startTime: string, endTime: string) {
  initialize();
  runSql(`INSERT INTO room_reservation (room_id, user_name, start_time, end_time, deleted) VALUES (${roomId}, '${escape(userName)}', '${startTime}', '${endTime}', 0);`);
  const row = runSql('SELECT last_insert_rowid() as id;', { json: true })[0];
  return { reservation_id: row.id, room_id: roomId, user_name: userName, start_time: startTime, end_time: endTime, deleted: 0 };
}

function escape(value: string) {
  return value.replace(/'/g, "''");
}
