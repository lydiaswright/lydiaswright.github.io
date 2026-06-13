/**
 * Scroll Animations using Intersection Observer
 * Triggers fade-in animations when elements enter viewport
 */

class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('[data-scroll-animate]');
        this.splitTextElements = document.querySelectorAll('[data-split-text]');
        this.observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        this.init();
    }

    init() {
        // Initialize split text animations
        this.initSplitText();

        // Initialize scroll animations
        this.initScrollObserver();

        // Add stagger delays to filmography cards
        this.addStaggerDelays();
    }

    initSplitText() {
        this.splitTextElements.forEach(element => {
            const text = element.textContent;
            const chars = text.split('');
            element.textContent = '';

            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.className = 'split-char';
                span.textContent = char === ' ' ? '\u00A0' : char; // Preserve spaces
                span.style.setProperty('--char-index', index);
                element.appendChild(span);
            });
        });
    }

    initScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optional: Unobserve after animation to improve performance
                    // observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    addStaggerDelays() {
        const productionCards = document.querySelectorAll('.production-card[data-scroll-animate]');
        productionCards.forEach((card, index) => {
            card.style.setProperty('--stagger-delay', index);
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ScrollAnimations();
    });
} else {
    new ScrollAnimations();
}
