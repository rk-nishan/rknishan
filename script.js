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
  const pubItems = document.querySelectorAll('.publication-item');
  const contactForm = document.getElementById('contact-form');
  const toastContainer = document.getElementById('toast-container');

  /* ==========================================================================
     Theme Switching (Light/Dark)
     ========================================================================== */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Switched to ${newTheme} mode`);
  });

  // Run theme init
  initTheme();

  /* ==========================================================================
     SPA Navigation
     ========================================================================== */
  const switchTab = (targetId) => {
    // Scroll to the content area on mobile, or top of page on desktop
    if (window.innerWidth < 992) {
      const bannerHeight = document.querySelector('.hero-banner').offsetHeight;
      const headerHeight = document.querySelector('.app-header').offsetHeight;
      window.scrollTo({
        top: bannerHeight + headerHeight - 20,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

    // Update address bar hash without trigger jump
    history.pushState(null, null, '#' + targetId);
  };

  // Nav Links click handler
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      switchTab(targetId);

      // Close mobile menu if open
      if (mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileNavTrigger.classList.remove('active');
      }
    });
  });

  // Handle page load hash
  const handleHashOnLoad = () => {
    const hash = window.location.hash.substring(1);
    const validSections = Array.from(sections).map(s => s.id);
    
    if (hash && validSections.includes(hash)) {
      switchTab(hash);
    }
  };

  window.addEventListener('load', handleHashOnLoad);
  // Also handle back/forward browser navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1) || 'home';
    switchTab(hash);
  });

  /* ==========================================================================
     Mobile Navigation Toggle
     ========================================================================== */
  mobileNavTrigger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileNavTrigger.classList.toggle('active');
  });

  // Close mobile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && 
        !mobileNavTrigger.contains(e.target) && 
        mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      mobileNavTrigger.classList.remove('active');
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
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Set active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      // Filter publications
      pubItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        // Hide card smoothly
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';

        setTimeout(() => {
          if (filterValue === 'all' || category === filterValue) {
            item.style.display = 'flex';
            // Trigger animation frame for showing
            requestAnimationFrame(() => {
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, 50);
            });
          } else {
            item.style.display = 'none';
          }
        }, 300);
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
     Contact Form Submit Handler (Mock Processing)
     ========================================================================== */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('.submit-btn');
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value;

      // Validate fields
      if (!name || !email || !subject || !message) {
        showToast('Please fill out all fields');
        return;
      }

      // Show spinner
      submitBtn.classList.add('loading');

      // Simulate network request (1.5 seconds)
      setTimeout(() => {
        // Clear form
        contactForm.reset();
        
        // Hide spinner
        submitBtn.classList.remove('loading');
        
        // Show success toast
        showToast('Message sent successfully!');
      }, 1500);
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
