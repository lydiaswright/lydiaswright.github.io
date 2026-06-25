/**
 * Navigation functionality
 * - Smooth scroll to sections
 * - Active section highlighting
 * - Mobile menu toggle
 * - Hide/show on scroll
 */

class Navigation {
    constructor() {
        this.nav = document.getElementById('nav');
        this.navToggle = document.getElementById('navToggle');
        this.navList = document.getElementById('navList');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.sections = document.querySelectorAll('section[id]');

        this.lastScrollY = window.scrollY;
        this.isMenuOpen = false;

        this.init();
    }

    init() {
        this.setupSmoothScroll();
        this.setupMobileMenu();
        this.setupScrollSpy();
        this.setupScrollBehavior();
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const navHeight = this.nav.offsetHeight;
                    const targetPosition = targetSection.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (this.isMenuOpen) {
                        this.closeMobileMenu();
                    }
                }
            });
        });
    }

    setupMobileMenu() {
        this.navToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen &&
                !this.navList.contains(e.target) &&
                !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.navToggle.classList.toggle('active');
        this.navList.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navToggle.classList.remove('active');
        this.navList.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupScrollSpy() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -60% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    this.updateActiveLink(sectionId);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateActiveLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    setupScrollBehavior() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        // Hide/show nav on scroll
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            // Scrolling down
            this.nav.classList.add('nav--hidden');
        } else {
            // Scrolling up
            this.nav.classList.remove('nav--hidden');
        }

        this.lastScrollY = currentScrollY;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Navigation();
    });
} else {
    new Navigation();
}
