const button = document.querySelector('.bang');
const ripple = document.querySelector('.ripple');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const description = document.querySelector('.button-description');
const language = document.querySelector('.button-language');
const hint = document.querySelector('.button-hint');
const heading = document.querySelector('h1');
const brand = document.querySelector('.brand');
const translations = [
  {
    lang: 'ru', label: 'RU / 01',
    description: 'Выбери файл и задание в LMS. Идея Bang Button — отправить домашку одним нажатием.',
    heading: ['Огромная кнопка, ', 'огромные деньги'],
    hint: 'Нажми → Қазақша',
    accessibleName: 'Описание Bang Button. Переключить на казахский язык',
    home: 'Bang Button — главная',
  },
  {
    lang: 'kk', label: 'KZ / 02',
    description: 'LMS жүйесіндегі тапсырма мен файлды таңда. Bang Button идеясы — үй жұмысын бір басумен жіберу.',
    heading: ['Үлкен батырма, ', 'үлкен ақша'],
    hint: 'Бас → English',
    accessibleName: 'Bang Button сипаттамасы. Ағылшын тіліне ауысу',
    home: 'Bang Button — басты бет',
  },
  {
    lang: 'en', label: 'EN / 03',
    description: 'Choose a file and an LMS assignment. The idea behind Bang Button: submit homework with one press.',
    heading: ['Big button, ', 'big money'],
    hint: 'Press → Русский',
    accessibleName: 'About Bang Button. Switch to Russian',
    home: 'Bang Button — home',
  },
];
let currentLanguage = 0;
let rippleAnimation;

button.addEventListener('click', () => {
  currentLanguage = (currentLanguage + 1) % translations.length;
  const text = translations[currentLanguage];
  document.documentElement.lang = text.lang;
  description.textContent = text.description;
  language.textContent = text.label;
  hint.textContent = text.hint;
  button.setAttribute('aria-label', text.accessibleName);
  brand.setAttribute('aria-label', text.home);
  const accent = document.createElement('span');
  accent.textContent = text.heading[1];
  heading.replaceChildren(text.heading[0], accent);
  document.title = `Bang Button — ${text.heading.join('')}`;
  document.querySelector('meta[name="description"]').content = text.description;

  if (reducedMotion.matches) return;

  rippleAnimation?.cancel();
  rippleAnimation = ripple.animate(
    [
      { transform: 'scale(0.85)', opacity: 0.6 },
      { transform: 'scale(1.16)', opacity: 0 },
    ],
    { duration: 500, easing: 'ease-out' },
  );
});
