import type { ProcessedEvent } from './types';


// ---------------------------------------------------------------------------
// 1. Shared-event detection
// ---------------------------------------------------------------------------

/**
 * Find events that share the same `uid` across different calendar entities,
 * then deduplicate: keep ONE representative event per shared uid and collect
 * ALL participating calendar colors into `sharedColors`.
 *
 * Returns a new array (non-shared events pass through unchanged).
 */
function deduplicateSharedEvents(
  events: ProcessedEvent[],
): ProcessedEvent[] {
  // Group events by uid (skip events without a uid)
  const byUid = new Map<string, ProcessedEvent[]>();
  const noUid: ProcessedEvent[] = [];

  for (const ev of events) {
    if (!ev.uid) {
      noUid.push(ev);
      continue;
    }
    let group = byUid.get(ev.uid);
    if (!group) {
      group = [];
      byUid.set(ev.uid, group);
    }
    group.push(ev);
  }

  const result: ProcessedEvent[] = [...noUid];

  for (const [, group] of byUid) {
    const distinctCalendars = new Set(group.map((e) => e.calendarEntity));

    if (distinctCalendars.size < 2) {
      // Not shared — but stabilize id on uid so it doesn't change
      // if the event transitions between shared/non-shared via filters
      const ev = group[0];
      result.push({
        ...ev,
        id: `uid-${ev.uid}-${ev.start.toISOString()}`,
      });
      continue;
    }

    // Deduplicate: keep only unique calendars (first occurrence wins)
    const seen = new Set<string>();
    const unique: ProcessedEvent[] = [];
    for (const ev of group) {
      if (!seen.has(ev.calendarEntity)) {
        seen.add(ev.calendarEntity);
        unique.push(ev);
      }
    }

    // Create a fresh object for the representative so Lit detects changes
    // when filters toggle (same base event, different sharedColors).
    // Use uid-based id so the event identity is stable across filter changes.
    const base = unique[0];
    const uid = group[0].uid!;
    result.push({
      ...base,
      id: `uid-${uid}-${base.start.toISOString()}`,
      sharedWith: unique.slice(1).map((e) => e.calendarEntity),
      sharedColors: unique.map((e) => e.color),
      sharedCalendarNames: unique.map((e) => e.calendarName),
      sharedAvatars: unique.map((e) => e.avatar),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. Column assignment (interval-graph colouring)
// ---------------------------------------------------------------------------

/**
 * Standard sweep-line column assignment for timed (non-all-day) events.
 *
 * - Sort by start time, breaking ties by longer duration first.
 * - Track occupied columns; assign each event to the leftmost free column.
 * - Compute cluster widths and set `totalColumns` on every member.
 * - Events beyond `maxColumns` are pushed into the last column (overflow /
 *   "+N more" indicator).
 *
 * All-day events are skipped (returned unchanged).
 * Mutates in place and returns the full array.
 */
function assignColumns(
  events: ProcessedEvent[],
): ProcessedEvent[] {
  const timed = events.filter((e) => !e.isAllDay);
  if (timed.length === 0) return events;

  // Sort: earliest start first; ties → longer event first
  timed.sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    const aDur = a.end.getTime() - a.start.getTime();
    const bDur = b.end.getTime() - b.start.getTime();
    return bDur - aDur; // longer first
  });

  // Identify clusters — groups of mutually overlapping events that form a
  // connected component on the time axis.
  interface Cluster {
    events: ProcessedEvent[];
    maxCol: number; // highest column index assigned + 1
  }

  const clusters: Cluster[] = [];
  let currentCluster: Cluster | null = null;
  let clusterEnd = 0;

  for (const ev of timed) {
    if (!currentCluster || ev.start.getTime() >= clusterEnd) {
      // Start a new cluster
      currentCluster = { events: [], maxCol: 0 };
      clusters.push(currentCluster);
      clusterEnd = ev.end.getTime();
    } else {
      clusterEnd = Math.max(clusterEnd, ev.end.getTime());
    }
    currentCluster.events.push(ev);
  }

  // Within each cluster, assign columns via a sweep-line.
  for (const cluster of clusters) {
    // columnEndTimes[i] = the earliest time column i becomes free
    const columnEndTimes: number[] = [];

    for (const ev of cluster.events) {
      const evStart = ev.start.getTime();
      let assignedCol = -1;

      // Find the leftmost column whose last event ends at or before this start
      for (let col = 0; col < columnEndTimes.length; col++) {
        if (columnEndTimes[col] <= evStart) {
          assignedCol = col;
          break;
        }
      }

      if (assignedCol === -1) {
        // No free column — open a new one
        assignedCol = columnEndTimes.length;
        columnEndTimes.push(ev.end.getTime());
      } else {
        columnEndTimes[assignedCol] = ev.end.getTime();
      }

      ev.column = assignedCol;
      cluster.maxCol = Math.max(cluster.maxCol, assignedCol + 1);
    }

    // totalColumns = actual column count (no clamping).
    // maxColumns only limits the width divisor so overflow events
    // are narrower but still visible (stacked with offset in the renderer).
    const totalCols = cluster.maxCol;
    for (const ev of cluster.events) {
      ev.totalColumns = totalCols;
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 3. Top-level orchestrator
// ---------------------------------------------------------------------------

/**
 * Main entry point for the event-processing pipeline.
 * Detects shared events, assigns columns, and splits by type.
 */
export function processEvents(events: ProcessedEvent[]): {
  timedEvents: ProcessedEvent[];
  allDayEvents: ProcessedEvent[];
} {
  const deduped = deduplicateSharedEvents(events);
  assignColumns(deduped);

  return {
    timedEvents: deduped.filter((e) => !e.isAllDay),
    allDayEvents: deduped.filter((e) => e.isAllDay),
  };
}
