// app.js - inamigos NGO Platform Interactions

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCanvas();
  initScrollAnimations();
  initDonationForm();
  initContactForm();
});

/* =========================================================================
   1. Navbar & Mobile Menu
   ========================================================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');

  // Change navbar appearance on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const spans = menuToggle.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  // Close menu and update active state when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* =========================================================================
   2. Interactive Floating Connective Circles (Hero Background)
   ========================================================================= */
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particlesArray = [];
  const numberOfParticles = 45;
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  const mouse = {
    x: null,
    y: null,
    radius: 130
  };

  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Start anywhere initially
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 20; // Start below the viewport
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.4 + 0.2); // Slow float upwards
      this.radius = Math.random() * 3 + 2;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)'; // Purple light
      ctx.fill();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Reset when particle goes above screen
      if (this.y < -10) {
        this.reset();
      }

      // Mouse interactive alignment
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 1.0;
          this.y += Math.sin(angle) * force * 1.0;
        }
      }
    }
  }

  function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }

  function connect() {
    for (let i = 0; i < particlesArray.length; i++) {
      for (let j = i + 1; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < 150) {
          const alpha = (150 - distance) / 150 * 0.12;
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`; // Soft emerald connectors
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
          ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    connect();
    particlesArray.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  init();
  animate();
}

/* =========================================================================
   3. Scroll Reveal & Scroll Spy Active Nav
   ========================================================================= */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  reveals.forEach(reveal => observer.observe(reveal));

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* =========================================================================
   4. Donation Chips Sync & Certificate Generation
   ========================================================================= */
function initDonationForm() {
  const form = document.getElementById('donation-form');
  const chips = document.querySelectorAll('.donation-chip');
  const amountInput = document.getElementById('donor-amount');
  
  // Modal Elements
  const modal = document.getElementById('certificate-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const closeBtnSec = document.getElementById('close-cert-btn');
  const downloadBtn = document.getElementById('download-cert-btn');

  // Handle Preset Donation Chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      amountInput.value = chip.getAttribute('data-amount');
    });
  });

  // Sync Input Value back to Tiers
  amountInput.addEventListener('input', () => {
    const val = amountInput.value.trim();
    chips.forEach(c => c.classList.remove('active'));
    
    // Activate corresponding chip if value matches a preset
    const match = document.querySelector(`.donation-chip[data-amount="${val}"]`);
    if (match) {
      match.classList.add('active');
    }
  });

  // Handle Form Submission & Certificate Modal Launch
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('donor-name').value.trim();
    const email = document.getElementById('donor-email').value.trim();
    const purpose = document.getElementById('donor-purpose').value;
    const amount = parseFloat(amountInput.value);

    if (!name || !email || !purpose || isNaN(amount) || amount <= 0) {
      alert('Please fill out all donation parameters correctly.');
      return;
    }

    // Intercept with simulated loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Processing Donation...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Render Dynamic Certificate and Launch Modal
      generateCertificate(name, amount, purpose);
      modal.classList.add('active');
      form.reset();
      
      // Default donation values resets
      chips.forEach(c => c.classList.remove('active'));
      const defaultChip = document.querySelector('.donation-chip[data-amount="200"]');
      if (defaultChip) defaultChip.classList.add('active');
      amountInput.value = '200';
    }, 1500);
  });

  // Close Modal Actions
  [closeBtn, closeBtnSec].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  });

  // Download Certificate Canvas as Image
  downloadBtn.addEventListener('click', () => {
    const canvas = document.getElementById('certificate-canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'inamigos_appreciation_certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

/**
 * Dynamically draws the Certificate of Appreciation onto the Canvas
 */
function generateCertificate(donorName, donationAmount, contributionPurpose) {
  const canvas = document.getElementById('certificate-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw elegant ivory paper backdrop
  ctx.fillStyle = '#fdfcf7';
  ctx.fillRect(0, 0, w, h);

  // 2. Draw thick outer borders
  ctx.strokeStyle = '#1a1c24';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // 3. Draw golden inset borders
  ctx.strokeStyle = '#c5a059'; // Golden tint
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, w - 50, h - 50);

  // Inset Corner highlights
  ctx.fillStyle = '#c5a059';
  const offset = 25;
  const size = 12;
  // Top-Left corner accent
  ctx.fillRect(offset, offset, size, size);
  // Top-Right corner accent
  ctx.fillRect(w - offset - size, offset, size, size);
  // Bottom-Left corner accent
  ctx.fillRect(offset, h - offset - size, size, size);
  // Bottom-Right corner accent
  ctx.fillRect(w - offset - size, h - offset - size, size, size);

  // 4. Draw Logo Mark / Shield at the top
  const centerX = w / 2;
  
  // Golden Badge Shield
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(centerX, 85, 24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#1a1c24';
  ctx.font = 'bold 13px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('inamigos', centerX, 89);

  // Decorative Horizontal lines on sides of the Shield
  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  // Left horizontal line
  ctx.beginPath();
  ctx.moveTo(centerX - 120, 85);
  ctx.lineTo(centerX - 35, 85);
  ctx.stroke();
  // Right horizontal line
  ctx.beginPath();
  ctx.moveTo(centerX + 35, 85);
  ctx.lineTo(centerX + 120, 85);
  ctx.stroke();

  // 5. Draw Title: CERTIFICATE OF APPRECIATION
  ctx.fillStyle = '#1a1c24';
  ctx.font = '700 28px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF APPRECIATION', centerX, 155);

  // Subtitle
  ctx.fillStyle = '#71717a';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('THIS CERTIFICATE IS GRATEFULLY PRESENTED TO', centerX, 195);

  // 6. Draw Donor Name (Calligraphy style, bold/italic)
  ctx.fillStyle = '#6d28d9'; // Warm purple/violet accent
  ctx.font = 'italic 700 36px "Outfit", sans-serif';
  ctx.fillText(donorName, centerX, 250);

  // Clean separator line under name
  ctx.strokeStyle = '#e4e4e7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 160, 270);
  ctx.lineTo(centerX + 160, 270);
  ctx.stroke();

  // 7. Draw Appreciation Body Content
  ctx.fillStyle = '#3f3f46';
  ctx.font = '300 14px "Plus Jakarta Sans", sans-serif';
  
  // Custom multi-line formatting
  const line1 = `In sincere recognition of their generous contribution of ₹${donationAmount.toFixed(2)}`;
  const line2 = `supporting our "${contributionPurpose}" program. This support drives critical digital education`;
  const line3 = "and companionship, building brighter futures for children across communities.";

  ctx.fillText(line1, centerX, 310);
  ctx.fillText(line2, centerX, 335);
  ctx.fillText(line3, centerX, 360);

  // 8. Signatures, Seals, and Metadata at the bottom
  const bottomY = 460;

  // Date Column
  ctx.fillStyle = '#71717a';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DATE', 150, bottomY);
  ctx.fillStyle = '#1a1c24';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('en-US', options);
  ctx.fillText(dateStr, 150, bottomY - 20);

  // Date border line
  ctx.strokeStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.moveTo(90, bottomY - 10);
  ctx.lineTo(210, bottomY - 10);
  ctx.stroke();

  // Signature Column (Right)
  ctx.fillStyle = '#71717a';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AUTHORIZED SIGNATURE', w - 150, bottomY);
  
  // Hand-drawn cursive effect signature representation
  ctx.fillStyle = '#1e3a8a'; // Deep blue signature ink
  ctx.font = 'italic 700 20px "Outfit", sans-serif';
  ctx.fillText('Dhanika Bhat', w - 150, bottomY - 22);

  // Signature underline
  ctx.strokeStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.moveTo(w - 210, bottomY - 10);
  ctx.lineTo(w - 90, bottomY - 10);
  ctx.stroke();

  // Seal / Gold Star Badge (Center)
  ctx.fillStyle = 'rgba(197, 160, 89, 0.1)';
  ctx.beginPath();
  ctx.arc(centerX, bottomY - 15, 30, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = '#c5a059';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, bottomY - 15, 30, 0, Math.PI*2);
  ctx.stroke();

  ctx.fillStyle = '#c5a059';
  ctx.font = 'bold 8px "Outfit", sans-serif';
  ctx.fillText('OFFICIAL', centerX, bottomY - 20);
  ctx.fillText('SEAL', centerX, bottomY - 10);

  // Certificate Unique ID (small corner annotation)
  const certId = `INA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '400 9px monospace';
  ctx.fillText(certId, centerX, h - 35);
}

/* =========================================================================
   5. General Contact Form Validation
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    statusDiv.style.display = 'none';
    statusDiv.className = 'form-status';

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const category = document.getElementById('form-category').value;
    const msg = document.getElementById('form-msg').value.trim();

    if (!name || !email || !category || !msg) {
      showStatus('All fields are required. Please check your input fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus('Please supply a valid email address.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      showStatus('Success! Your message was received by the inamigos team. We will contact you shortly.', 'success');
      form.reset();
    }, 1500);
  });

  function showStatus(text, type) {
    statusDiv.textContent = text;
    statusDiv.classList.add(type);
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
