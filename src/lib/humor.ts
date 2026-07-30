const LINES = [
  "Still asleep... let's poke it again.",
  "Congratulations, another request has bravely sacrificed itself to CORS.",
  "We're not checking if it's alive—we're just knocking on the door.",
  "Your free hosting plan called. It misses your traffic.",
  "If this dashboard is closed, your servers are officially on their own.",
  "Wake up, little service. Your users have expectations.",
  "Another polite knock into the void.",
  "Sent. The response is a mystery. As intended.",
];

export const EMPTY_LINES = {
  noMonitors: "No monitors yet. Your services are sleeping soundly, unbothered.",
  noResults: "Nothing matches. Even the search is taking a nap.",
  noLogs: "No activity yet. Suspiciously peaceful around here.",
};

export function randomLine(seed?: number) {
  const i =
    seed === undefined
      ? Math.floor(Math.random() * LINES.length)
      : seed % LINES.length;
  return LINES[i];
}

export const STATUS_LABEL: Record<string, string> = {
  idle: "Idle",
  scheduled: "Request Scheduled",
  waiting: "Waiting...",
  sent: "Wake Request Sent",
  error: "Network Error",
  paused: "Paused",
};
