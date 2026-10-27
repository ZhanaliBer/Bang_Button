const button = document.querySelector('.bang');
const ripple = document.querySelector('.ripple');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let rippleAnimation;

button.addEventListener('click', () => {
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
