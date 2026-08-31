import type { ItineraryItem } from '../../contracts/entities';

type ZonedPart = { type: string; value: string };

const asUtcMilliseconds = (parts: ZonedPart[]) => {
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
};

const zonedParts = (instant: number, timeZone: string) => new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
}).formatToParts(new Date(instant));

/** Converts a TripDay calendar date and the user's wall-clock time to a persisted UTC ISO timestamp. */
export function toZonedIso(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const requestedWallClock = Date.UTC(year, month - 1, day, hour, minute, 0);
  let instant = requestedWallClock;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const zoneOffset = asUtcMilliseconds(zonedParts(instant, timeZone)) - instant;
    const resolved = requestedWallClock - zoneOffset;
    if (resolved === instant) break;
    instant = resolved;
  }

  return new Date(instant).toISOString();
}

/** Appends after the final current key while preserving a unique, lexically sortable insertion key. */
export function nextAppendSortKey(items: ItineraryItem[], randomId: () => string = () => crypto.randomUUID()): string {
  const last = items.map((item) => item.sortKey).sort().at(-1);
  return `${last ?? 'm0'}~${randomId()}`;
}
