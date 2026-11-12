// Birthday Surprise Website Interactive Logic

(function () {
  'use strict';

  // State Management
  const state = {
    friendName: localStorage.getItem('bday_friend_name') || 'Bestie',
    senderName: localStorage.getItem('bday_sender_name') || 'Your Best Friend',
    candlesBlown: false,
    musicPlaying: false,
    audioCtx: null,
    musicTimeoutId: null
  };

  // Sound Engine (Web Audio API for zero-dependency high-fidelity chimes & music)
  class SoundEngine {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Gentle music box chime
    playTone(freq, duration = 0.8, delay = 0, type = 'sine') {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell / Celesta envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    // Balloon pop sound
    playPop() {
      this.init();
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, startTime);
      osc.frequency.exponentialRampToValueAtTime(90, startTime + 0.12);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    }

    // Magical celebratory chime fanfare
    playFanfare() {
      this.init();
      const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      chords.forEach((note, idx) => {
        this.playTone(note, 1.2, idx * 0.1, 'sine');
      });
    }

    // Happy birthday melody notes sequence (C4=261.63, D4=293.66, etc.)
    getBirthdayMelody() {
      const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
      return [
        { note: C4, d: 0.35 }, { note: C4, d: 0.2 }, { note: D4, d: 0.5 }, { note: C4, d: 0.5 }, { note: F4, d: 0.5 }, { note: E4, d: 0.8 },
        { note: C4, d: 0.35 }, { note: C4, d: 0.2 }, { note: D4, d: 0.5 }, { note: C4, d: 0.5 }, { note: G4, d: 0.5 }, { note: F4, d: 0.8 },
        { note: C4, d: 0.35 }, { note: C4, d: 0.2 }, { note: C5, d: 0.5 }, { note: A4, d: 0.5 }, { note: F4, d: 0.4 }, { note: E4, d: 0.4 }, { note: D4, d: 0.7 },
        { note: B4, d: 0.35 }, { note: B4, d: 0.2 }, { note: A4, d: 0.5 }, { note: F4, d: 0.5 }, { note: G4, d: 0.5 }, { note: F4, d: 1.0 }
      ];
    }

    playMelody(callback) {
      this.init();
      const melody = this.getBirthdayMelody();
      let currentDelay = 0;

      melody.forEach((item) => {
        this.playTone(item.note, item.d * 1.5, currentDelay, 'sine');
        currentDelay += item.d * 0.95;
      });

      if (callback) {
        state.musicTimeoutId = setTimeout(callback, currentDelay * 1000 + 500);
      }
    }
  }

  const sound = new SoundEngine();

  // Floating Ambient Canvas Particles (Hearts, Sparkles, Pastel Orbs)
  function initAmbientParticles() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#fbcfe8', '#e9d5ff', '#fed7aa', '#fde047', '#fed7e2'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.6 - 0.2,
        opacity: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * 0.05
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += Math.sin(Date.now() * 0.002) * p.pulse;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(0.8, p.opacity));
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  // Confetti Launcher
  function fireConfetti(options = {}) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e06d9f', '#9067c6', '#f7b733', '#ff758c', '#89f7fe'],
        ...options
      });
    }
  }

  function fireCelebrationStreamers() {
    if (typeof confetti !== 'function') return;
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors: ['#e06d9f', '#f7b733', '#9067c6']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors: ['#e06d9f', '#f7b733', '#9067c6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  // Update personalized text in DOM
  function updatePersonalizedContent() {
    const friendNameEls = document.querySelectorAll('.dynamic-friend-name');
    friendNameEls.forEach(el => {
      el.textContent = state.friendName;
    });

    const senderNameEls = document.querySelectorAll('.dynamic-sender-name');
    senderNameEls.forEach(el => {
      el.textContent = state.senderName;
    });

    const inputFriend = document.getElementById('input-friend-name');
    if (inputFriend) inputFriend.value = state.friendName;

    const inputSender = document.getElementById('input-sender-name');
    if (inputSender) inputSender.value = state.senderName;
  }

  // Setup DOM Events
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientParticles();
    updatePersonalizedContent();

    // 1. Opening Curtain / Gift Box
    const giftBox = document.getElementById('gift-card-trigger');
    const curtain = document.getElementById('curtain-overlay');

    if (giftBox && curtain) {
      giftBox.addEventListener('click', () => {
        sound.init();
        sound.playFanfare();
        fireCelebrationStreamers();
        curtain.classList.add('opened');

        // Optional: trigger background music gently
        setTimeout(() => {
          toggleMusic(true);
        }, 1200);
      });
    }

    // 2. Interactive Cake & Candles
    const blowBtn = document.getElementById('blow-cake-btn');
    const candleFlames = document.querySelectorAll('.candle-flame');
    const wishBox = document.getElementById('wish-revealed-box');

    function blowOutCandles() {
      if (state.candlesBlown) return;
      state.candlesBlown = true;

      candleFlames.forEach(flame => {
        flame.classList.add('blown');
      });

      sound.playFanfare();
      fireCelebrationStreamers();

      if (wishBox) {
        wishBox.classList.add('show');
      }

      if (blowBtn) {
        blowBtn.innerHTML = '✨ Wish Made & Blessed! ✨';
        blowBtn.style.opacity = '0.9';
        blowBtn.style.pointerEvents = 'none';
      }
    }

    if (blowBtn) {
      blowBtn.addEventListener('click', blowOutCandles);
    }

    candleFlames.forEach(flame => {
      flame.addEventListener('click', blowOutCandles);
    });

    // 3. Flip Cards
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        sound.playTone(600, 0.15, 0, 'sine');
      });
    });

    // 4. Balloon Popping Mini-Game
    const balloons = document.querySelectorAll('.balloon-item');
    const secretReveal = document.getElementById('secret-compliment-reveal');
    const compliments = [
      "✨ \"Your smile literally lights up the entire room!\"",
      "💖 \"You're the first person I want to tell everything to.\"",
      "🌟 \"Thank you for always being my safe space and biggest cheerleader.\"",
      "🌸 \"You are resilient, hilarious, and genuinely one-of-a-kind.\"",
      "🧁 \"Life is 1000x sweeter and more fun with you in it!\""
    ];

    balloons.forEach((balloon, index) => {
      balloon.addEventListener('click', (e) => {
        if (balloon.classList.contains('popped')) return;

        balloon.classList.add('popped');
        sound.playPop();

        const rect = balloon.getBoundingClientRect();
        fireConfetti({
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          particleCount: 40,
          spread: 45
        });

        if (secretReveal) {
          secretReveal.style.opacity = '0';
          setTimeout(() => {
            secretReveal.textContent = compliments[index % compliments.length];
            secretReveal.style.opacity = '1';
            secretReveal.style.transform = 'scale(1.05)';
            setTimeout(() => {
              secretReveal.style.transform = 'scale(1)';
            }, 200);
          }, 150);
        }
      });
    });

    // 5. Music Controller Toggle
    const musicBtn = document.getElementById('audio-controller-btn');
    const musicStatusText = document.getElementById('music-status-text');

    function loopMelody() {
      if (!state.musicPlaying) return;
      sound.playMelody(() => {
        if (state.musicPlaying) {
          loopMelody();
        }
      });
    }

    function toggleMusic(forcePlay = false) {
      sound.init();
      if (forcePlay) {
        state.musicPlaying = true;
      } else {
        state.musicPlaying = !state.musicPlaying;
      }

      if (state.musicPlaying) {
        if (musicStatusText) musicStatusText.textContent = 'Playing Melody 🎵';
        loopMelody();
      } else {
        if (musicStatusText) musicStatusText.textContent = 'Play Melody 🎵';
        if (state.musicTimeoutId) clearTimeout(state.musicTimeoutId);
      }
    }

    if (musicBtn) {
      musicBtn.addEventListener('click', () => toggleMusic(false));
    }

    // 6. Finale Celebrate Again Button
    const celebrateAgainBtn = document.getElementById('celebrate-again-btn');
    if (celebrateAgainBtn) {
      celebrateAgainBtn.addEventListener('click', () => {
        sound.playFanfare();
        fireCelebrationStreamers();
      });
    }

    // 7. Personalize Modal
    const modalTrigger = document.getElementById('personalize-modal-trigger');
    const modal = document.getElementById('personalize-modal');
    const modalClose = document.getElementById('modal-close');
    const modalSave = document.getElementById('modal-save');

    if (modalTrigger && modal) {
      modalTrigger.addEventListener('click', () => {
        modal.classList.add('show');
      });
    }

    if (modalClose && modal) {
      modalClose.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }

    if (modalSave && modal) {
      modalSave.addEventListener('click', () => {
        const inputFriend = document.getElementById('input-friend-name');
        const inputSender = document.getElementById('input-sender-name');

        if (inputFriend && inputFriend.value.trim()) {
          state.friendName = inputFriend.value.trim();
          localStorage.setItem('bday_friend_name', state.friendName);
        }
        if (inputSender && inputSender.value.trim()) {
          state.senderName = inputSender.value.trim();
          localStorage.setItem('bday_sender_name', state.senderName);
        }

        updatePersonalizedContent();
        modal.classList.remove('show');
        fireConfetti({ particleCount: 50 });
      });
    }
  });
})();
