(function () {
    function initSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link[href^="#"]');

        skipLinks.forEach((link) => {
            link.addEventListener('click', () => {
                const targetSelector = link.getAttribute('href');
                const target = targetSelector ? document.querySelector(targetSelector) : null;

                if (!target) {
                    return;
                }

                requestAnimationFrame(() => {
                    if (!target.hasAttribute('tabindex')) {
                        target.setAttribute('tabindex', '-1');
                    }

                    target.focus();
                });
            });
        });
    }

    function initSmoothScrolling() {
        const pageAnchors = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
        const navBar = document.querySelector('.navbar');

        function getAnchorOffset() {
            if (!navBar) {
                return 8;
            }

            return Math.ceil(navBar.getBoundingClientRect().height + 8);
        }

        function getScrollTarget(target) {
            const sectionTitle = target.querySelector('.section-title');
            const contactForm = target.querySelector('.contact-form-shell');

            return sectionTitle || contactForm || target;
        }

        function updateAnchorOffset() {
            document.documentElement.style.setProperty('--nav-scroll-offset', `${getAnchorOffset()}px`);
        }

        updateAnchorOffset();

        if (typeof ResizeObserver === 'function' && navBar) {
            const navResizeObserver = new ResizeObserver(updateAnchorOffset);
            navResizeObserver.observe(navBar);
        } else {
            window.addEventListener('resize', updateAnchorOffset);
        }

        pageAnchors.forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetSelector = link.getAttribute('href');

                if (!targetSelector || targetSelector === '#') {
                    return;
                }

                const target = document.querySelector(targetSelector);

                if (!target) {
                    return;
                }

                event.preventDefault();

                const scrollTarget = getScrollTarget(target);

                const targetTop = Math.max(
                    scrollTarget.getBoundingClientRect().top + window.scrollY - getAnchorOffset(),
                    0
                );

                window.scrollTo({
                    top: targetTop,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                });

                if (window.location.hash !== targetSelector) {
                    window.history.pushState(null, '', targetSelector);
                }
            });
        });
    }

    function initMobileNavigation() {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const navLinks = document.querySelector('.nav-links');

        if (!mobileMenuButton || !navLinks) {
            return;
        }

        const mobileMediaQuery = window.matchMedia('(max-width: 1100px)');

        function isMobileViewport() {
            return mobileMediaQuery.matches;
        }

        function setMenuState(isOpen) {
            if (!isMobileViewport()) {
                navLinks.classList.remove('active');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                navLinks.removeAttribute('aria-hidden');
                return;
            }

            navLinks.classList.toggle('active', isOpen);
            mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
            navLinks.setAttribute('aria-hidden', String(!isOpen));
        }

        function closeMenu(options) {
            const shouldRestoreFocus = options && options.restoreFocus;
            setMenuState(false);

            if (shouldRestoreFocus) {
                mobileMenuButton.focus();
            }
        }

        mobileMenuButton.addEventListener('click', () => {
            if (!isMobileViewport()) {
                return;
            }

            const isOpen = navLinks.classList.contains('active');
            setMenuState(!isOpen);
        });

        document.addEventListener('click', (event) => {
            if (!isMobileViewport()) {
                return;
            }

            const clickedInsideMenu = navLinks.contains(event.target);
            const clickedMenuButton = mobileMenuButton.contains(event.target);

            if (!clickedInsideMenu && !clickedMenuButton && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu({ restoreFocus: true });
            }
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (isMobileViewport()) {
                    closeMenu();
                }
            });
        });

        if (typeof mobileMediaQuery.addEventListener === 'function') {
            mobileMediaQuery.addEventListener('change', () => setMenuState(false));
        } else {
            window.addEventListener('resize', () => setMenuState(false));
        }

        setMenuState(false);
    }

    function initProjectModal() {
        const modal = document.getElementById('project-modal');

        if (!modal) {
            return;
        }

        const modalImage = document.getElementById('project-modal-image');
        const modalCaption = document.getElementById('project-modal-caption');
        const modalTitle = document.getElementById('project-modal-title');
        const openButtons = document.querySelectorAll('.project-photo-item');
        const closeButton = document.querySelector('.project-modal-close');
        const prevButton = document.querySelector('.project-modal-nav.prev');
        const nextButton = document.querySelector('.project-modal-nav.next');

        if (!modalImage || !modalCaption || !closeButton || !prevButton || !nextButton) {
            return;
        }

        let activeProjectLabel = '';
        let activeImages = [];
        let activeIndex = 0;
        let lastFocusedElement = null;

        function getFocusableElements() {
            return Array.from(
                modal.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            );
        }

        function renderModalImage() {
            const imagePath = activeImages[activeIndex];
            const imagePosition = activeIndex + 1;
            const imageCount = activeImages.length;

            modalImage.src = imagePath;
            modalImage.alt = activeProjectLabel + ', gallery image ' + imagePosition + ' of ' + imageCount;
            modalCaption.textContent = activeProjectLabel + ' - image ' + imagePosition + ' of ' + imageCount;

            if (modalTitle) {
                modalTitle.textContent = activeProjectLabel + ' gallery';
            }
        }

        function openProject(projectLabel, images, triggerButton) {
            if (!images.length) {
                return;
            }

            lastFocusedElement = triggerButton || document.activeElement;
            activeProjectLabel = projectLabel;
            activeImages = images;
            activeIndex = 0;

            renderModalImage();
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            closeButton.focus();
        }

        function closeProject() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            modalImage.src = '';
            modalImage.alt = '';
            modalCaption.textContent = '';

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        function showPrevious() {
            activeIndex = (activeIndex - 1 + activeImages.length) % activeImages.length;
            renderModalImage();
        }

        function showNext() {
            activeIndex = (activeIndex + 1) % activeImages.length;
            renderModalImage();
        }

        openButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const projectLabel = button.getAttribute('data-project') || 'Project';
                const images = (button.getAttribute('data-images') || '').split('|').filter(Boolean);

                openProject(projectLabel, images, button);
            });
        });

        closeButton.addEventListener('click', closeProject);
        prevButton.addEventListener('click', showPrevious);
        nextButton.addEventListener('click', showNext);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeProject();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!modal.classList.contains('open')) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeProject();
                return;
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPrevious();
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNext();
                return;
            }

            if (event.key === 'Tab') {
                const focusableElements = getFocusableElements();

                if (!focusableElements.length) {
                    event.preventDefault();
                    return;
                }

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    function initializeSite() {
        initSkipLinks();
        initSmoothScrolling();
        initMobileNavigation();
        initProjectModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSite);
    } else {
        initializeSite();
    }
})();
