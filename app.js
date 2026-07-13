/* ==========================================================================
   GURUPAD DENTAL CLINIC - PREMIUM INTERACTIONS & ANIMATION CODE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Luxury Custom Cursor Logic ---
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');

  if (cursor && follower && window.innerWidth > 1024) {
    document.addEventListener('mousemove', (e) => {
      // Small dot position
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      // Delay follower animation
      follower.animate({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`
      }, { duration: 500, fill: "forwards" });
    });

    // Add hover effect classes on clickable components
    const clickables = document.querySelectorAll('a, button, select, input, textarea, .treatment-card, .review-card');
    clickables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      item.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  // --- 2. Preloader & Image Sequence Preloading ---
  const preloader = document.getElementById('preloader');
  const loadProgress = document.getElementById('load-progress');
  const loadText = document.getElementById('load-text');

  // Canvas settings
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');

  // Image sequence specifications
  const frameCount = 300;
  const images = [];
  let loadedCount = 0;
  let currentFrameIndex = 1;

  // Helper to format frame path with 3-digit padding (001 to 300)
  const getFramePath = (index) => {
    const paddedIndex = index.toString().padStart(3, '0');
    return `ezgif-63c494d00237f217-jpg/ezgif-frame-${paddedIndex}.jpg`;
  };

  // Start preloading images
  function preloadImages() {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      img.onload = () => {
        loadedCount++;
        const percentage = Math.round((loadedCount / frameCount) * 100);

        if (loadProgress) loadProgress.style.width = `${percentage}%`;
        if (loadText) loadText.textContent = `Preparing 3D Experience (${percentage}%)`;

        if (loadedCount === frameCount) {
          onAllImagesLoaded();
        }
      };

      img.onerror = () => {
        console.warn(`Failed to preload image: ${img.src}`);
        loadedCount++;
        if (loadedCount === frameCount) {
          onAllImagesLoaded();
        }
      };

      images.push(img);
    }
  }

  function onAllImagesLoaded() {
    if (loadProgress) loadProgress.style.width = '100%';
    if (loadText) loadText.textContent = '3D Scene Ready (100%)';

    // Initialize Canvas dimensions and draw initial frame
    resizeCanvas();

    // Short delay for a clean entrance
    setTimeout(() => {
      if (preloader) preloader.classList.add('fade-out');
      document.body.style.overflow = 'visible'; // Enable body scroll

      // Draw first frame
      drawImageFrame(1);
    }, 800);
  }

  // Start preloading on load
  preloadImages();

  // --- 3. Canvas Resizing & Rendering Cover logic ---
  function resizeCanvas() {
    if (!canvas) return;

    // Support High DPI displays (Retina screens)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Scale context back to CSS dimensions
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Redraw current active frame
    drawImageFrame(currentFrameIndex);
  }

  window.addEventListener('resize', resizeCanvas);

  function drawImageFrame(index) {
    const img = images[index - 1];
    if (!img || !canvas) return;

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (!imgWidth || !imgHeight) return;

    // aspect-ratio cover matching math
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let sWidth = imgWidth;
    let sHeight = imgHeight;
    let sx = 0;
    let sy = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      sHeight = imgWidth / canvasRatio;
      sy = (imgHeight - sHeight) / 2;
    } else {
      // Canvas is taller than image
      sWidth = imgHeight * canvasRatio;
      sx = (imgWidth - sWidth) / 2;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
  }

  // --- 4. Scroll Control Mapping ---
  const heroSection = document.getElementById('home');
  const heroOverlay = document.getElementById('hero-overlay');

  // Navigation header change style on scroll
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('main > section, .hero-scroll-container');

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header scrolled logic
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Mapped scroll values for Hero sticky image sequence
    if (heroSection && loadedCount >= frameCount) {
      const heroRect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight;
      const scrollableRange = heroHeight - window.innerHeight;

      // Calculate fraction of current progress (0.0 to 1.0)
      let scrollFraction = -heroRect.top / scrollableRange;
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));

      // Map scroll progress to frame index (1 to 300)
      const frameIndex = Math.min(
        frameCount,
        Math.max(1, Math.ceil(scrollFraction * frameCount))
      );

      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        // Request animation frame for smooth frame drawing
        requestAnimationFrame(() => drawImageFrame(currentFrameIndex));
      }

      // Overlay Text animations (fade out linearly as user scrolls 30% of the section)
      if (heroOverlay) {
        const textOpacity = Math.max(0, 1 - (scrollFraction / 0.3));
        const textTranslateY = -scrollFraction * 120; // Float upwards slightly

        heroOverlay.style.opacity = textOpacity;
        heroOverlay.style.transform = `translate(-50%, calc(-50% + ${textTranslateY}px))`;

        // Hide overlay clicks when invisible
        if (textOpacity <= 0.05) {
          heroOverlay.style.pointerEvents = 'none';
        } else {
          heroOverlay.style.pointerEvents = 'auto';
        }
      }
    }

    // Active navigation indicator sync
    let currentActiveId = 'home';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        currentActiveId = id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActiveId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll);

  // --- 5. Mobile Navigation Menu Toggle ---
  const burgerToggle = document.getElementById('burger-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (burgerToggle && navMenu) {
    burgerToggle.addEventListener('click', () => {
      burgerToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // --- 6. Scroll Reveal Animations (Intersection Observer) ---
  const revealedElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve once revealed
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealedElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 7. Google Reviews Slider Logic ---
  const track = document.getElementById('reviews-track');
  const slides = document.querySelectorAll('.review-slide');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (track && slides.length > 0) {
    let currentIdx = 0;

    function getSlidesPerView() {
      if (window.innerWidth > 1024) return 3;
      if (window.innerWidth > 768) return 2;
      return 1;
    }

    function updateSlider() {
      const slidesPerView = getSlidesPerView();
      const maxIdx = Math.max(0, slides.length - slidesPerView);
      currentIdx = Math.min(currentIdx, maxIdx);

      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${currentIdx * slideWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
      const slidesPerView = getSlidesPerView();
      const maxIdx = Math.max(0, slides.length - slidesPerView);
      if (currentIdx < maxIdx) {
        currentIdx++;
        updateSlider();
      } else {
        // loop back
        currentIdx = 0;
        updateSlider();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--;
        updateSlider();
      } else {
        // go to end
        const slidesPerView = getSlidesPerView();
        currentIdx = Math.max(0, slides.length - slidesPerView);
        updateSlider();
      }
    });

    // Handle window resize for slider dimensions
    window.addEventListener('resize', updateSlider);

    // Initial call
    setTimeout(updateSlider, 500);
  }

  // --- 8. Appointment Booking Form Validation & Submission ---
  const form = document.getElementById('appointment-form');
  const successBanner = document.getElementById('form-success');
  const dateInput = document.getElementById('form-date');

  // Set minimum date in appointment form to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      const name = document.getElementById('form-name');
      const phone = document.getElementById('form-phone');
      const service = document.getElementById('form-service');
      const date = document.getElementById('form-date');

      // Validate Name
      if (!name.value.trim()) {
        name.parentElement.classList.add('invalid');
        isValid = false;
      } else {
        name.parentElement.classList.remove('invalid');
      }

      // Validate Phone (Basic Check: at least 10 numbers)
      const phoneClean = phone.value.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        phone.parentElement.classList.add('invalid');
        isValid = false;
      } else {
        phone.parentElement.classList.remove('invalid');
      }

      // Validate Treatment
      if (!service.value) {
        service.parentElement.classList.add('invalid');
        isValid = false;
      } else {
        service.parentElement.classList.remove('invalid');
      }

      // Validate Date
      if (!date.value) {
        date.parentElement.classList.add('invalid');
        isValid = false;
      } else {
        date.parentElement.classList.remove('invalid');
      }

      if (isValid) {
        // Hide errors
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(g => g.classList.remove('invalid'));

        // Show success animation banner
        successBanner.style.display = 'flex';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Disable button
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.querySelector('span').textContent = 'Appointment Requested';

        // Save form submission or format for WhatsApp redirect (Bonus Luxury feature)
        const waMessage = encodeURIComponent(
          `Hello Doctor, I would like to book an appointment.\n\n` +
          `Name: ${name.value.trim()}\n` +
          `Phone: ${phone.value.trim()}\n` +
          `Treatment: ${service.value}\n` +
          `Preferred Date: ${date.value}\n` +
          `Note: ${document.getElementById('form-message').value.trim()}`
        );

        // Open WhatsApp web or App with text after 2 seconds
        setTimeout(() => {
          window.open(`https://wa.me/916354695478?text=${waMessage}`, '_blank');
        }, 1500);
      }
    });

    // Clear invalid highlights when user edits fields
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        input.parentElement.classList.remove('invalid');
      });
      input.addEventListener('change', () => {
        input.parentElement.classList.remove('invalid');
      });
    });
  }
});
