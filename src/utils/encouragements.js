const ENCOURAGEMENTS = [
  "Nice! Keep that momentum going \u{1F680}",
  "Your brain is literally forming new neural pathways right now \u{1F9E0}",
  "One step closer to AI fluency \u2728",
  "That's the way! Consistency beats intensity \u{1F4AA}",
  "You're doing amazing \u2014 seriously \u{1F31F}",
  "Knowledge unlocked! \u{1F513}",
  "Future AI expert in the making \u{1F3AF}",
  "Every checkbox is progress. You're crushing it \u{1F525}",
  "Look at you go! \u{1F44F}",
  "Learning compounds \u2014 every bit matters \u{1F4C8}",
  "Another one down! You're on fire \u{1F525}",
  "Your future self is thanking you right now \u{1F64F}",
  "Building that AI knowledge base, one step at a time \u{1F9F1}",
  "Dopamine hit: earned \u{1F3AE}",
  "You showed up today. That's what matters \u{1F4AB}",
  "Momentum is a powerful thing \u{26A1}",
  "That checkbox didn't stand a chance \u{1F4A5}",
  "Progress isn't always linear, but yours is looking great \u{1F4CA}",
  "Keep stacking those wins \u{1F3C6}",
  "The more you learn, the more connections your brain makes \u{1F52C}",
  "You're literally getting smarter right now \u{1F393}",
  "Small steps, big results \u{1F463}",
  "AI won't replace you \u2014 you're learning to work WITH it \u{1F91D}",
  "Checked off and crushing it \u2705",
];

export function getRandomEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}
