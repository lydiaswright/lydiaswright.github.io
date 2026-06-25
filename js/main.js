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
        let visible = 0;
        this.productionCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const show = filter === 'all' || category === filter;

            if (show) {
                visible++;
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

        // Show an empty-state message when a filter has no credits (e.g. Screen)
        const empty = document.querySelector('.filmography__empty');
        if (empty) empty.hidden = visible !== 0;
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

        // Capture a freeze-frame at ~0.5s and use it as the poster
        try {
            this.capturePosterAt(video, 0.5);
        } catch (e) {
            // non-fatal
        }
    }

    capturePosterAt(video, time = 0.5) {
        if (!video) return;

        // Use an off-screen clone so we don't change the visible video's currentTime
        const srcEl = video.querySelector('source');
        const src = (srcEl && srcEl.src) || video.currentSrc || video.src;
        if (!src) return;

        const off = document.createElement('video');
        off.muted = true;
        off.preload = 'auto';
        off.crossOrigin = 'anonymous';
        off.src = src;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let settled = false;
        let cleanup = () => {
            settled = true;
            off.pause();
            off.removeAttribute('src');
            off.load && off.load();
            off.remove();
        };

        const doDraw = () => {
            try {
                const width = off.videoWidth || video.videoWidth || 1280;
                const height = off.videoHeight || video.videoHeight || 720;
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(off, 0, 0, width, height);
                try {
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    video.setAttribute('poster', dataUrl);
                } catch (err) {
                    // toDataURL can fail under CORS; ignore
                }
            } catch (err) {
                // drawing failed
            } finally {
                cleanup();
            }
        };

        const onError = () => {
            if (settled) return;
            cleanup();
        };

        const onLoadedMeta = () => {
            if (settled) return;
            const target = (off.duration && time > off.duration) ? Math.max(0, off.duration - 0.1) : time;
            const onSeeked = () => {
                off.removeEventListener('seeked', onSeeked);
                doDraw();
            };
            off.addEventListener('seeked', onSeeked);
            try { off.currentTime = target; } catch (e) { doDraw(); }
        };

        // Fallback timeout in case loading/seeking stalls
        const timeout = setTimeout(() => {
            if (!settled) {
                try { off.currentTime = Math.min(0.5, off.duration || 0.5); } catch (e) {}
                doDraw();
            }
        }, 5000);

        off.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
        off.addEventListener('error', onError, { once: true });
        off.addEventListener('emptied', onError, { once: true });
        off.addEventListener('canplay', () => {}, { once: true });

        // ensure cleanup clears timeout
        const origCleanup = cleanup;
        cleanup = () => {
            clearTimeout(timeout);
            try { origCleanup(); } catch (e) {}
        };

        // start loading
        document.body.appendChild(off);
        // If metadata already available
        if (off.readyState >= 1) {
            onLoadedMeta();
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

            img.addEventListener('error', function handleImgError() {
                // Try a few fallback paths before marking as empty.
                const original = img.getAttribute('src') || '';
                const repoPrefix = '/lydiaswright.github.io';
                const candidates = [];

                if (original.startsWith('/')) {
                    candidates.push(original.replace(/^\//, ''));
                    candidates.push(repoPrefix + original);
                } else {
                    candidates.push('/' + original);
                    candidates.push('./' + original);
                    candidates.push(repoPrefix + '/' + original);
                }

                let i = 0;
                const tryNext = () => {
                    if (i >= candidates.length) {
                        mark(img);
                        return;
                    }
                    img.removeEventListener('error', handleImgError);
                    img.addEventListener('error', tryNext, { once: true });
                    img.src = candidates[i++];
                };

                tryNext();
            });
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
