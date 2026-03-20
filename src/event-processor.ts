import type { ProcessedEvent } from './types';


// ---------------------------------------------------------------------------
// 1. Shared-event detection
// ---------------------------------------------------------------------------

/**
 * Find events that share the same `uid` across different calendar entities
 * and annotate them with `sharedWith` / `sharedColors`.
 * Mutates the input array in place and returns it.
 */
function detectSharedEvents(
  events: ProcessedEvent[],
): ProcessedEvent[] {
  // Group events by uid (skip events without a uid)
  const byUid = new Map<string, ProcessedEvent[]>();
  for (const ev of events) {
    if (!ev.uid) continue;
    let group = byUid.get(ev.uid);
    if (!group) {
      group = [];
      byUid.set(ev.uid, group);
    }
    group.push(ev);
  }

  for (const [, group] of byUid) {
    // Only mark as shared when the same uid appears in 2+ distinct calendars
    const distinctCalendars = new Set(group.map((e) => e.calendarEntity));
    if (distinctCalendars.size < 2) continue;

    for (const ev of group) {
      ev.sharedWith = group
        .filter((other) => other.calendarEntity !== ev.calendarEntity)
        .map((other) => other.calendarEntity);
      ev.sharedColors = group
        .filter((other) => other.calendarEntity !== ev.calendarEntity)
        .map((other) => other.color);
    }
  }

  return events;
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
  detectSharedEvents(events);
  assignColumns(events);

  return {
    timedEvents: events.filter((e) => !e.isAllDay),
    allDayEvents: events.filter((e) => e.isAllDay),
  };
}
