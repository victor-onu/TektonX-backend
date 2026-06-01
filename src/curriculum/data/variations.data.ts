// Variation pools for weekly digest intro/outro lines.
// Rotated deterministically by week number so every week feels a little different
// without depending on AI. Phrases are deliberately generic so they fit any track.

export const MENTEE_INTROS: string[] = [
  "Here's your focus for this week on the {track} track.",
  "Welcome to a new week. Here's what to dig into on the {track} track.",
  "Quick brief — this is what {track} is exploring this week.",
  "Your {track} focus for the week, ready when you are.",
  "Let's keep the momentum. Here's this week's {track} plan.",
  "One week closer. Here's what's on deck for {track}.",
];

export const MENTEE_OUTROS: string[] = [
  "Need help? Reach out to your mentor through the dashboard — they're expecting to hear from you this week.",
  "Stuck on something? Your mentor is one message away on the dashboard.",
  "Don't wait until you're blocked — ping your mentor early in the week if anything feels unclear.",
  "Remember, your mentor is here for you. Use them, especially when things get tricky.",
  "Tip of the week: share what you learn (or struggle with) with your mentor — it sharpens both of you.",
  "Stay curious. If a topic excites you, dig deeper than the resource suggests.",
];

export const MENTOR_INTROS: string[] = [
  "Here's what your mentee{plural} {verb} working on this week. A quick check-in goes a long way.",
  "Quick brief — your mentee{plural} {verb} on this week's topic. Drop them a note when you can.",
  "Your weekly mentor brief is here. A small message from you can unblock a whole week.",
  "What your mentee{plural} {verb} learning right now, plus a nudge to stay in touch.",
  "One more week into the program. Here's how you can support your mentee{plural} this week.",
  "Mentor digest time. Skim what's on their plate and pick a moment to reach out.",
];

export const MENTOR_OUTROS: string[] = [
  "Thank you for the time and energy you give your mentees. You're a big part of what makes TektonX work.",
  "Your impact compounds week over week. A short check-in is never wasted.",
  "You're the reason your mentees finish stronger than they started. Thank you for showing up.",
  "Mentoring is a craft — and you're getting sharper at it every week. Thank you.",
  "Even five minutes of your attention this week can change the trajectory of a mentee's program.",
  "TektonX runs on mentors like you. We appreciate every Slack message, every call, every nudge.",
];

export function pickByWeek(pool: string[], week: number): string {
  if (pool.length === 0) return '';
  const idx = ((week - 1) % pool.length + pool.length) % pool.length;
  return pool[idx];
}
