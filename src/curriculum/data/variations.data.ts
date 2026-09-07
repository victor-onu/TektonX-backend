// Variation pools for weekly digest intro/outro lines.
// Rotated deterministically by week number so every week feels a little different
// without depending on AI. All variations work for any week (1-12).
//
// Placeholders supported (replaced in WeeklyDigestService):
//   {week}    : current week number (1-12)
//   {track}   : recipient's track name (mentee only)
//   {plural}  : "" for one mentee, "s" for many (mentor only)
//   {verb}    : "is" for one mentee, "are" for many (mentor only)

export const MENTEE_INTROS: string[] = [
  'Welcome to Week {week} of the TektonX Cohort. We are excited to see your progress as you continue your learning journey on the {track} track.',
  'Welcome back to Week {week} on TektonX. This week is designed to deepen your understanding of {track} and keep your momentum going.',
  "Hello again, builder. We're stepping into Week {week} of the program, and there's plenty in store for the {track} track this week.",
  "Week {week} is here. Your {track} journey continues, and we're proud of how far you've already come.",
  "Welcome to Week {week} of the cohort. Let's keep building strong on the {track} track. Here's what's on your plate this week.",
  "We hope you're settling well into the program. Stepping into Week {week} of TektonX, here's your focus for the {track} track.",
];

export const MENTEE_OUTROS: string[] = [
  'Please ensure you stay connected with your mentor through your WhatsApp group for guidance and support throughout the week.',
  "Stay engaged in your WhatsApp group with your mentor. They're there to support you when things feel unclear.",
  "If anything feels tough this week, don't keep it to yourself. Reach out to your mentor on your WhatsApp group early.",
  'Your mentor is just a WhatsApp message away. Share your wins, your blockers, and your questions freely.',
  "Use your WhatsApp group actively this week. Share what you're learning and what you're struggling with.",
  'Stay close to your mentor and group this week. Consistent conversation is what makes the learning stick.',
];

// Every mentor intro must include both appreciation AND encouragement to keep going.
export const MENTOR_INTROS: string[] = [
  'Welcome to Week {week} of the TektonX Cohort. We sincerely appreciate your continued commitment to guiding and supporting your mentee{plural} through this journey, and we encourage you to keep that momentum going this week.',
  "As we step into Week {week} of the cohort, we want to thank you for the time and care you've poured into your mentee{plural} so far. Please continue to walk closely with them this week.",
  "Welcome to Week {week} of the program. Your dedication to your mentee{plural} is the heart of TektonX, and we are truly grateful. Let's keep the momentum strong this week.",
  "Hello, mentor. As Week {week} begins, we want to sincerely appreciate everything you've already done for your mentee{plural}, and to encourage you to keep up the great work.",
  'Welcome to Week {week} of the TektonX Cohort. We deeply value your consistency and care, and we ask that you continue to stay engaged with your mentee{plural} this week.',
  'Stepping into Week {week} of the program. Thank you for showing up week after week for your mentee{plural}. Your impact is real, and we encourage you to keep pouring into them this week.',
];

export const MENTOR_OUTROS: string[] = [
  'Kindly ensure you maintain regular communication with your mentee{plural} on your WhatsApp group to keep them aligned and motivated. Thank you once again for your dedication and impact. Kind regards, TektonX Team.',
  'Keep the WhatsApp group active this week. A quick message or voice note from you can carry a mentee through a tough day. Thank you for showing up.',
  'Please stay in touch with your mentee{plural} via your WhatsApp group throughout the week. Your consistency is what makes this work. Kind regards, TektonX Team.',
  'Thank you for being part of this. A message in your WhatsApp group this week, even a brief one, goes further than you know.',
  'Stay close to your mentee{plural} on WhatsApp this week. Your guidance is the heart of the program. Kind regards, TektonX Team.',
  'We deeply appreciate the time and care you give your mentee{plural}. Please continue to stay engaged with them on your WhatsApp group. Thank you.',
];

export function pickByWeek(pool: string[], week: number): string {
  if (pool.length === 0) return '';
  const idx = (((week - 1) % pool.length) + pool.length) % pool.length;
  return pool[idx];
}
