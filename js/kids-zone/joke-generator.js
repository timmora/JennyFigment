/* ============================================
   JENNY FIGMENT — Grandpa Tony Joke Generator
   ============================================ */

const JOKES = [
  { setup: "Why did the book go to the doctor?", punchline: "Because it had too many stories!" },
  { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore! 💤" },
  { setup: "Why can't Elsa have a balloon?", punchline: "Because she'll let it go! ⛄" },
  { setup: "What do you get when you cross a snowman and a vampire?", punchline: "Frostbite! 🧛" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field! 🌾" },
  { setup: "What do you call a fish without eyes?", punchline: "A fsh! 🐟" },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese! 🧀" },
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything! ⚛️" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear! 🐻" },
  { setup: "What do you call a noodle in disguise?", punchline: "An impasta! 🍝" },
  { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired! 🚲" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved! 🌊" },
  { setup: "Why do cows wear bells?", punchline: "Because their horns don't work! 🐄" },
  { setup: "What do you call a sleeping bull?", punchline: "A bulldozer! 🐂" },
  { setup: "What kind of tree fits in your hand?", punchline: "A palm tree! 🌴" },
  { setup: "What do you call a magic dog?", punchline: "A labracadabrador! 🐕" },
  { setup: "Why did the banana go to the doctor?", punchline: "Because it wasn't peeling well! 🍌" },
  { setup: "What do elves learn in school?", punchline: "The elf-abet! 🧝" },
  { setup: "Why did the teacher wear sunglasses?", punchline: "Because her students were so bright! ☀️" },
  { setup: "What do you call a dinosaur that crashes their car?", punchline: "Tyrannosaurus wrecks! 🦖" },
  { setup: "Why did the golfer bring an extra pair of socks?", punchline: "In case he got a hole in one! ⛳" },
  { setup: "What do you call a parade of rabbits hopping backwards?", punchline: "A receding hare-line! 🐰" },
  { setup: "Why did Jenny Figment bring a ladder to the library?", punchline: "Because she heard the books were on a higher level! 📚" },
  { setup: "What did Grandpa Tony say when he sat on a pin?", punchline: "Nothing — it was a silent PRICK! 😄 (Kidding! He said OUCH!)" },
];

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

document.addEventListener('DOMContentLoaded', () => {
  const setupEl = document.getElementById('joke-setup');
  const punchlineEl = document.getElementById('joke-punchline');
  const revealBtn = document.getElementById('reveal-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentEl = document.getElementById('joke-current');
  const totalEl = document.getElementById('joke-total');
  const jokeCard = document.getElementById('joke-card');

  if (!setupEl || !punchlineEl || !revealBtn || !nextBtn) return;

  let deck = shuffle(JOKES);
  let index = 0;
  let revealed = false;

  if (totalEl) totalEl.textContent = String(JOKES.length);

  function loadJoke(i) {
    const joke = deck[i];
    if (!joke) return;
    revealed = false;

    punchlineEl.classList.remove('is-revealed');
    punchlineEl.textContent = '';
    revealBtn.style.display = 'inline-flex';
    nextBtn.style.display = 'none';

    setupEl.textContent = joke.setup;
    if (currentEl) currentEl.textContent = String(i + 1);
  }

  function revealPunchline() {
    if (revealed) return;
    const joke = deck[index];
    if (!joke) return;
    revealed = true;
    punchlineEl.textContent = joke.punchline;
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        punchlineEl.classList.add('is-revealed');
      });
    });
    revealBtn.style.display = 'none';
    nextBtn.style.display = 'inline-flex';
  }

  function nextJoke() {
    index++;
    if (index >= deck.length) {
      deck = shuffle(JOKES);
      index = 0;
    }
    loadJoke(index);
  }

  revealBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    revealPunchline();
  });
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextJoke();
  });

  jokeCard?.addEventListener('click', (e) => {
    const t = e.target;
    if (t === revealBtn || t === nextBtn || revealBtn.contains(t) || nextBtn.contains(t)) return;
    jokeCard.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    if (!jokeCard?.contains(document.activeElement)) return;
    const ae = document.activeElement;
    if (ae === revealBtn || ae === nextBtn) return;
    if (e.key === ' ') e.preventDefault();
    if (!revealed) revealPunchline();
    else nextJoke();
  });

  loadJoke(0);
});
