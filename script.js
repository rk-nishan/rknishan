/* ==========================================================================
   Rasel Khan Nishan - Portfolio Script
   Interactivity, SPA navigation, theme switching, contact form & filters
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Select DOM Elements
  const themeToggle = document.getElementById('theme-toggle');
  const mobileNavTrigger = document.getElementById('mobile-nav-trigger');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('.content-section');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const pubCopyButtons = document.querySelectorAll('.pub-copy-btn');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const pubItems = document.querySelectorAll('.publication-item, .publication-filter-group');
  const contactForm = document.getElementById('contact-form');
  const toastContainer = document.getElementById('toast-container');

  /* ==========================================================================
     Theme Switching (Light/Dark)
     ========================================================================== */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    localStorage.removeItem('theme');
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
    } else {
      applyTheme('light');
    }
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    showToast(`Switched to ${newTheme} mode`);
  });

  // Run theme init
  initTheme();

  /* ==========================================================================
     SPA Navigation
     ========================================================================== */
  const scrollToTargetSection = (targetId) => {
    const targetSection = document.getElementById(targetId);

    if (!targetSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (window.innerWidth < 992) {
      if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const headerHeight = document.querySelector('.app-header')?.offsetHeight || 0;
      const targetTop = targetSection.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(targetTop - headerHeight - 12, 0),
        behavior: 'smooth'
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchTab = (targetId, { updateHistory = true } = {}) => {
    // Deactivate all links and sections
    navLinks.forEach(link => {
      if (link.getAttribute('data-target') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    sections.forEach(section => {
      if (section.id === targetId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    if (window.innerWidth < 992) {
      document.body.classList.toggle('mobile-home-view', targetId === 'home');
    } else {
      document.body.classList.remove('mobile-home-view');
    }

    // Update the address bar only for direct navigation. Back/forward events
    // reuse existing history entries instead of creating new ones.
    if (updateHistory) {
      const currentTarget = window.location.hash.substring(1) || 'home';

      if (currentTarget !== targetId) {
        const nextUrl = targetId === 'home'
          ? window.location.pathname + window.location.search
          : '#' + targetId;
        history.pushState(null, '', nextUrl);
      }
    }

    // Wait for the active section to become visible, then scroll to it.
    requestAnimationFrame(() => {
      scrollToTargetSection(targetId);
    });
  };

  // Nav Links click handler
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');

      // Close mobile menu if open
      if (mobileMenu.classList.contains('open')) {
        setMobileMenuState(false);
      }

      switchTab(targetId);
    });
  });

  const handleInitialRoute = () => {
    const hash = window.location.hash.substring(1);
    const validSections = Array.from(sections).map(section => section.id);
    const initialTarget = hash && validSections.includes(hash) ? hash : 'home';
    switchTab(initialTarget, { updateHistory: false });
  };

  handleInitialRoute();

  // Also handle back/forward browser navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1) || 'home';
    switchTab(hash, { updateHistory: false });
  });

  /* ==========================================================================
     Mobile Navigation Toggle
     ========================================================================== */
  const setMobileMenuState = (isOpen) => {
    mobileMenu.classList.toggle('open', isOpen);
    mobileNavTrigger.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    mobileNavTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileNavTrigger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };

  mobileNavTrigger.setAttribute('aria-expanded', 'false');

  mobileNavTrigger.addEventListener('click', () => {
    setMobileMenuState(!mobileMenu.classList.contains('open'));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992 && mobileMenu.classList.contains('open')) {
      setMobileMenuState(false);
    }
    if (window.innerWidth < 992) {
      const activeSection = document.querySelector('.content-section.active');
      document.body.classList.toggle('mobile-home-view', activeSection?.id === 'home');
    } else {
      document.body.classList.remove('mobile-home-view');
    }
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && 
        !mobileNavTrigger.contains(e.target) && 
        mobileMenu.classList.contains('open')) {
      setMobileMenuState(false);
    }
  });

  /* ==========================================================================
     Copy to Clipboard Helper
     ========================================================================== */
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          showToast('Copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          showToast('Failed to copy content');
        });
    });
  });

  /* ==========================================================================
     Publications Filters
     ========================================================================== */
  pubItems.forEach(item => {
    item.dataset.defaultDisplay = window.getComputedStyle(item).display;
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');

      const filterValue = tab.getAttribute('data-filter');

      // Filter publication cards and the conference section
      pubItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const shouldShow = filterValue === 'all' || category === filterValue;
        
        // Hide card smoothly
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';

        setTimeout(() => {
          if (shouldShow) {
            item.hidden = false;
            item.style.display = item.dataset.defaultDisplay || '';
            // Trigger animation frame for showing
            requestAnimationFrame(() => {
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, 50);
            });
          } else {
            item.hidden = true;
            item.style.display = 'none';
          }
        }, 180);
      });
    });
  });

  /* ==========================================================================
     Copy Citation Helper
     ========================================================================== */
  pubCopyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const citationText = btn.getAttribute('data-citation');
      
      navigator.clipboard.writeText(citationText)
        .then(() => {
          showToast('Citation copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy citation: ', err);
          showToast('Failed to copy citation');
        });
    });
  });

  /* ==========================================================================
     Contact Form Submit Handler
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.submit-btn');
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Validate fields
      if (!name || !email || !subject || !message) {
        showToast('Please fill out all fields');
        return;
      }

      // Show spinner
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Formspree request failed');
        }

        contactForm.reset();
        showToast('Message sent successfully!');
      } catch (err) {
        console.error('Failed to send message: ', err);
        showToast('Message could not be sent. Please email directly.');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }

  /* ==========================================================================
     Toast Notifications Generator
     ========================================================================== */
  const showToast = (message) => {
    // Create toast elements
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Add success icon and text
    toast.innerHTML = `
      <span class="toast-success-icon">✓</span>
      <span class="toast-text">${message}</span>
    `;

    // Append to container
    toastContainer.appendChild(toast);

    // Trigger sliding animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        toast.classList.add('show');
      }, 50);
    });

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      // Remove from DOM after animation finishes
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };
});
