/**
 * Gallery functionality
 * - Horizontal scroll with snap
 * - Drag to scroll (optional)
 * - Keyboard navigation
 */

class Gallery {
    constructor() {
        this.galleryContainer = document.querySelector('.gallery__scroll-container');

        if (!this.galleryContainer) return;

        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;

        this.init();
    }

    init() {
        this.setupDragScroll();
        this.setupKeyboardNav();
        this.setupTouchScroll();
    }

    setupDragScroll() {
        // Mouse drag to scroll
        this.galleryContainer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.galleryContainer.style.cursor = 'grabbing';
            this.startX = e.pageX - this.galleryContainer.offsetLeft;
            this.scrollLeft = this.galleryContainer.scrollLeft;
        });

        this.galleryContainer.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.galleryContainer.style.cursor = 'grab';
        });

        this.galleryContainer.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.galleryContainer.style.cursor = 'grab';
        });

        this.galleryContainer.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.galleryContainer.offsetLeft;
            const walk = (x - this.startX) * 2; // Scroll speed multiplier
            this.galleryContainer.scrollLeft = this.scrollLeft - walk;
        });

        // Set initial cursor
        this.galleryContainer.style.cursor = 'grab';
    }

    setupTouchScroll() {
        // Touch devices naturally handle scroll
        // Just ensure momentum scrolling is enabled
        this.galleryContainer.style.webkitOverflowScrolling = 'touch';
    }

    setupKeyboardNav() {
        const galleryItems = this.galleryContainer.querySelectorAll('.gallery__item');

        galleryItems.forEach((item, index) => {
            // Make items focusable
            item.setAttribute('tabindex', '0');

            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' && index < galleryItems.length - 1) {
                    e.preventDefault();
                    galleryItems[index + 1].focus();
                    this.scrollToItem(galleryItems[index + 1]);
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    galleryItems[index - 1].focus();
                    this.scrollToItem(galleryItems[index - 1]);
                }
            });
        });
    }

    scrollToItem(item) {
        const containerRect = this.galleryContainer.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const scrollAmount = itemRect.left - containerRect.left + this.galleryContainer.scrollLeft;

        this.galleryContainer.scrollTo({
            left: scrollAmount - (containerRect.width - itemRect.width) / 2,
            behavior: 'smooth'
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Gallery();
    });
} else {
    new Gallery();
}
