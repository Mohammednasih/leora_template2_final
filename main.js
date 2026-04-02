import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

/* Update ScrollTrigger on Lenis scroll */
lenis.on('scroll', ScrollTrigger.update);

/* Sync Lenis with GSAP's ticker */
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

function initParallax() {
  const parallaxImages = document.querySelectorAll('.parallax-img');
  parallaxImages.forEach(img => {
    // A more pronounced zoom and pan for the "zoom and fit" premium feel
    gsap.fromTo(img, 
      { scale: 1.15, yPercent: -5 },
      {
        scale: 1, yPercent: 5,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: img.closest('.screen-section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  });
}

// Function to generate and animate floating flower petals
function createPetals(containerSelector, count = 15) {
  const containers = document.querySelectorAll(containerSelector);
  containers.forEach(container => {
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.classList.add('petal');
      
      // Randomize properties
      const size = Math.random() * 15 + 10; // 10px to 25px
      const left = Math.random() * 100; // 0% to 100vw
      const duration = Math.random() * 5 + 5; // 5s to 10s
      const delay = Math.random() * -10; // start instantly at different phases
      const hue = Math.random() * 20 - 10; // slight color variation
      
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.left = `${left}%`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.filter = `hue-rotate(${hue}deg)`;
      
      container.appendChild(petal);
    }
  });
}

// Intro Video Logic
function initIntro() {
  const introOverlay = document.getElementById('intro-overlay');
  const startBtn = document.getElementById('start-btn');
  const introVideo = document.getElementById('intro-video');

  if (!introOverlay || !startBtn || !introVideo) return;

  startBtn.addEventListener('click', () => {
    // Fade out the open button
    gsap.to(startBtn, { opacity: 0, duration: 0.5, onComplete: () => startBtn.style.display = 'none' });
    
    // Fade in and play the cinematic envelope opening
    gsap.to(introVideo, { opacity: 1, duration: 0.5 });
    introVideo.play().catch(e => console.log('Autoplay prevented', e));

    // CRITICAL iOS FIX: Manually trigger play on ambient videos during first user interaction!
    document.querySelectorAll('.bird-animation').forEach(vid => {
      vid.play().catch(e => console.log('Bird video autoplay prevented', e));
    });

    let finished = false;
    
    const finishIntro = () => {
      if (finished) return;
      finished = true;
      gsap.to(introOverlay, { 
        opacity: 0, 
        duration: 1.5, 
        ease: 'power2.inOut',
        onComplete: () => {
          introOverlay.style.display = 'none';
          document.body.classList.remove('intro-active');
          ScrollTrigger.refresh(); // Ensure GSAP triggers recalibrate perfectly
        }
      });
    };

    // Transition gently slightly before the video fully ends to ensure seamless cut
    introVideo.addEventListener('timeupdate', () => {
      if (introVideo.duration && introVideo.duration - introVideo.currentTime <= 0.3) {
        finishIntro();
      }
    });

    introVideo.addEventListener('ended', finishIntro);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize intro overlay
  initIntro();
  
  // Initialize image parallax
  initParallax();
  
  // Create animated flower petals in the main sections
  createPetals('#media-1', 20);
  createPetals('#media-2', 20);
  
  // Venue parallax logic
  const venueSection = document.getElementById('section-venue');
  const venueImg = document.getElementById('venue-parallax');
  if (venueSection && venueImg) {
    gsap.to(venueImg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: venueSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Rose image pop-up entering Date Section
  const roseImg = document.getElementById('rose-img');
  if (roseImg) {
    gsap.fromTo(roseImg,
      { y: 150, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: '#section-date',
          start: 'top 50%',
        }
      }
    );
  }

  // Final section animation
  const hubImg = document.getElementById('hub-image');
  if (hubImg) {
    gsap.fromTo(hubImg, 
      { y: 100, opacity: 0 },
      { 
        y: -30, opacity: 1, duration: 1.5, ease: "power2.out",
        scrollTrigger: {
          trigger: '#section-final',
          start: 'top 50%',
        }
      }
    );
  }
});

let totalRevealed = 0;

function initScratchCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  // Dimensions rely on parent size which may be dynamic
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Draw the conical metallic gradient
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  
  if (ctx.createConicGradient) {
    const gradient = ctx.createConicGradient(0, cx, cy);
    gradient.addColorStop(0, '#d4af37');
    gradient.addColorStop(0.2, '#fff2cd');
    gradient.addColorStop(0.4, '#d4af37');
    gradient.addColorStop(0.6, '#997300');
    gradient.addColorStop(0.8, '#fff2cd');
    gradient.addColorStop(1, '#d4af37');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = '#d4af37';
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let isPainting = false;
  let scratchedPixels = 0;
  let totalPixels = Math.PI * (cx * cx); // approximate circle area
  let hasPopped = false;

  function scratch(e) {
    if (hasPopped) return;
    e.preventDefault();
    const bRect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / bRect.width;
    const scaleY = canvas.height / bRect.height;

    const x = (clientX - bRect.left) * scaleX;
    const y = (clientY - bRect.top) * scaleY;

    emitScratchSparkles(clientX, clientY);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Check scratched percentage
    scratchedPixels += Math.PI * 15 * 15;
    
    // Pop per circle when 50%+ is scratched
    if (scratchedPixels > totalPixels * 0.5 && !hasPopped) {
      hasPopped = true;
      gsap.to(canvas, { opacity: 0, duration: 0.4 });
      
      // Fire small popper
      fireConfetti(bRect.left + bRect.width / 2, bRect.top + bRect.height / 2, 30);
      
      totalRevealed++;
      if (totalRevealed === 3) {
        // Fire huge popper when all are completed
        setTimeout(() => {
          fireConfetti(window.innerWidth / 2, window.innerHeight / 2, 150, 100);
        }, 400);
      }
    }
  }

  canvas.addEventListener('mousedown', (e) => { isPainting = true; scratch(e); });
  canvas.addEventListener('mousemove', (e) => { if(isPainting) scratch(e); });
  canvas.addEventListener('mouseup', () => { isPainting = false; });
  canvas.addEventListener('mouseleave', () => { isPainting = false; });

  canvas.addEventListener('touchstart', (e) => { isPainting = true; scratch(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { if(isPainting) scratch(e); }, { passive: false });
  canvas.addEventListener('touchend', () => { isPainting = false; });
}

function emitScratchSparkles(x, y) {
  if (Math.random() > 0.3) return;
  confetti({
    particleCount: 2,
    startVelocity: 10,
    spread: 60,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#c59b27', '#f4e27c', '#ffffff'],
    ticks: 50,
    gravity: 0.5,
    scalar: Math.random() * 0.5 + 0.3,
    disableForReducedMotion: true
  });
}

function fireConfetti(x, y, count = 100, spread = 70) {
  confetti({
    particleCount: count,
    spread: spread,
    origin: { y: y / window.innerHeight, x: x / window.innerWidth },
    colors: ['#d4af37', '#ffffff', '#4a5d43']
  });
}

// Instead of setting fixed size, wait for layout then init
window.addEventListener('load', () => {
  initScratchCanvas('canvas-1');
  initScratchCanvas('canvas-2');
  initScratchCanvas('canvas-3');
});

