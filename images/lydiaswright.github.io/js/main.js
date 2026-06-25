/**
 * Main application file
 * - Filmography filtering
 * - Additional interactions
 */

class PortfolioApp {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.productionCards = document.querySelectorAll('.production-card');

        this.init();
    }

    init() {
        this.setupFiltering();
        this.setupVideoControls();
        this.setupImageFallbacks();
        this.handleExternalLinks();
    }

    setupFiltering() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.getAttribute('data-filter');
                this.filterProductions(filter);
                this.updateActiveFilter(button);
            });
        });
    }

    filterProductions(filter) {
        this.productionCards.forEach(card => {
            const category = card.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                // Re-trigger animation
                card.classList.remove('animated');
                setTimeout(() => {
                    card.classList.add('animated');
                }, 10);
            } else {
                card.classList.add('hidden');
            }
        });
    }

    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('filter-btn--active');
        });
        activeButton.classList.add('filter-btn--active');
    }

    setupVideoControls() {
        const video = document.getElementById('reelVideo');

        if (!video) return;

        // Optional: Add custom play/pause on click
        video.addEventListener('click', () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        // Pause video when scrolling away from section
        const reelSection = document.getElementById('reel');
        if (reelSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                    }
                });
            }, {
                threshold: 0.5
            });

            observer.observe(reelSection);
        }
    }

    setupImageFallbacks() {
        // Until real photography is added, mark wrappers of missing images
        // so a tasteful gradient placeholder shows instead of a broken icon.
        const mark = (img) => {
            const wrapper = img.closest(
                '.about__image-wrapper, .production-card__image-wrapper, .gallery__item'
            );
            if (wrapper) wrapper.classList.add('is-empty');
        };
        document.querySelectorAll('img').forEach((img) => {
            if (img.complete && img.naturalWidth === 0) {
                mark(img);
            }
            img.addEventListener('error', () => mark(img));
        });
    }

    handleExternalLinks() {
        // Add external link indicators
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        externalLinks.forEach(link => {
            link.setAttribute('aria-label', `${link.textContent} (opens in new tab)`);
        });
    }
}

// Performance optimization: Lazy load images
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }

    init() {
        // Modern browsers support native lazy loading
        // This is a fallback for older browsers
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading is supported
            return;
        }

        // Fallback for older browsers
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        this.images.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Utility: Detect reduced motion preference
function respectsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Initialize application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    new PortfolioApp();
    new LazyLoader();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, LazyLoader };
}
