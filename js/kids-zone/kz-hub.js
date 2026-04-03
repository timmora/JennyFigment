/* ============================================
   JENNY FIGMENT — Kids Zone hub (imagination spark)
   No network, no storage — random prompts only
   ============================================ */

const SPARKS = [
  'Invent a snack that has never existed. What is it called, and what does it taste like?',
  'Draw a map of a secret island only you know about. What lives there?',
  'If your pet (or a stuffed animal) could talk for one day, what would they say first?',
  'Design a door that leads anywhere you want. Where does it open?',
  'Write one sentence about a character who is afraid of something silly — then make them brave.',
  'Imagine a sport played on the moon. What are the rules?',
  'What would a library look like if it was built inside a giant tree?',
  'Create a new holiday. What do people celebrate, and what color is everything?',
  'If you could shrink to the size of a bug, where would you explore first?',
  'What does the inside of a cloud feel like in your imagination?',
  'Build a robot friend in your mind. What is its special skill?',
  'Tell a story that starts with: “The merry-go-round started to hum…”',
  'What if bedtime happened at noon and lunch happened at midnight?',
  'Invent a word that means “extraordinary friend.” Use it in a sentence.',
  'What would Jenny Figment pack for a trip to Planet Olii?',
  'Describe a song only ghosts can hear.',
  'If your shadow could run away for an adventure, where would it go?',
  'What grows in a garden where every plant is made of ideas?',
  'Design a superhero whose power is kindness. How do they save the day?',
  'What is hiding under the Big Toy in your imagination?',
];

function pickRandom(prev) {
  if (SPARKS.length < 2) return SPARKS[0];
  let next;
  do {
    next = SPARKS[Math.floor(Math.random() * SPARKS.length)];
  } while (next === prev);
  return next;
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('kz-spark-text');
  const btn = document.getElementById('kz-spark-new');
  if (!el) return;

  let last = '';
  function show() {
    last = pickRandom(last);
    el.textContent = last;
  }

  show();
  btn?.addEventListener('click', show);
});
