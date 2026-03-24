(function () {
    /**
     * Lightweight development-only accessibility helper.
     *
     * This is intentionally limited to simple heuristics and should not be
     * treated as proof of WCAG or ADA compliance.
     */
    class AccessibilityChecker {
        constructor(root) {
            this.root = root || document;
            this.issues = [];
        }

        addIssue(type, element, message, suggestion) {
            this.issues.push({
                type: type,
                element: element,
                message: message,
                suggestion: suggestion
            });
        }

        getAccessibleName(element) {
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledBy = element.getAttribute('aria-labelledby');

            if (ariaLabel && ariaLabel.trim()) {
                return ariaLabel.trim();
            }

            if (ariaLabelledBy) {
                const referencedText = ariaLabelledBy
                    .split(/\s+/)
                    .map((id) => {
                        const labelElement = document.getElementById(id);
                        return labelElement ? labelElement.textContent.trim() : '';
                    })
                    .join(' ')
                    .trim();

                if (referencedText) {
                    return referencedText;
                }
            }

            return element.textContent.trim();
        }

        run() {
            this.issues = [];
            this.checkImages();
            this.checkButtons();
            this.checkLinks();
            this.checkHeadingOrder();
            this.checkIframes();
            this.checkFormFields();
            this.checkDuplicateIds();
            this.report();
            return this.issues;
        }

        checkImages() {
            this.root.querySelectorAll('img').forEach((image, index) => {
                if (!image.hasAttribute('alt')) {
                    this.addIssue(
                        'error',
                        image,
                        'Image ' + (index + 1) + ' is missing an alt attribute.',
                        'Add alt text for informative images, or alt="" for decorative images.'
                    );
                }
            });
        }

        checkButtons() {
            this.root.querySelectorAll('button').forEach((button, index) => {
                if (!this.getAccessibleName(button)) {
                    this.addIssue(
                        'error',
                        button,
                        'Button ' + (index + 1) + ' does not have an accessible name.',
                        'Add visible text, aria-label, or aria-labelledby.'
                    );
                }
            });
        }

        checkLinks() {
            this.root.querySelectorAll('a').forEach((link, index) => {
                const href = link.getAttribute('href');
                const accessibleName = this.getAccessibleName(link);

                if (!href) {
                    this.addIssue(
                        'warning',
                        link,
                        'Link ' + (index + 1) + ' is missing an href attribute.',
                        'Add an href or use a button element for actions.'
                    );
                }

                if (href === '#') {
                    this.addIssue(
                        'warning',
                        link,
                        'Link ' + (index + 1) + ' points to "#".',
                        'Use a real destination or convert the control to a button.'
                    );
                }

                if (!accessibleName) {
                    this.addIssue(
                        'error',
                        link,
                        'Link ' + (index + 1) + ' does not have an accessible name.',
                        'Add visible link text, aria-label, or aria-labelledby.'
                    );
                }
            });
        }

        checkHeadingOrder() {
            const headings = Array.from(this.root.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            let previousLevel = 0;

            headings.forEach((heading, index) => {
                const level = Number(heading.tagName.slice(1));

                if (index === 0 && level !== 1) {
                    this.addIssue(
                        'warning',
                        heading,
                        'The first heading on the page is not an h1.',
                        'Start the page heading structure with a single h1 when appropriate.'
                    );
                }

                if (previousLevel && level > previousLevel + 1) {
                    this.addIssue(
                        'warning',
                        heading,
                        'Heading level jumps from h' + previousLevel + ' to h' + level + '.',
                        'Avoid skipping heading levels where possible.'
                    );
                }

                previousLevel = level;
            });
        }

        checkIframes() {
            this.root.querySelectorAll('iframe').forEach((iframe, index) => {
                const title = iframe.getAttribute('title');

                if (!title || !title.trim()) {
                    this.addIssue(
                        'error',
                        iframe,
                        'Iframe ' + (index + 1) + ' is missing a title.',
                        'Add a descriptive title attribute so screen reader users know what the iframe contains.'
                    );
                }
            });
        }

        checkFormFields() {
            const fields = this.root.querySelectorAll('input, select, textarea');

            fields.forEach((field, index) => {
                const id = field.getAttribute('id');
                const hasLabel = id ? this.root.querySelector('label[for="' + CSS.escape(id) + '"]') : null;
                const accessibleName = this.getAccessibleName(field);

                if (!hasLabel && !accessibleName) {
                    this.addIssue(
                        'warning',
                        field,
                        'Form field ' + (index + 1) + ' may not have a label.',
                        'Associate a label element or use aria-label/aria-labelledby.'
                    );
                }
            });
        }

        checkDuplicateIds() {
            const seenIds = new Map();

            this.root.querySelectorAll('[id]').forEach((element) => {
                const id = element.id;

                if (!seenIds.has(id)) {
                    seenIds.set(id, element);
                    return;
                }

                this.addIssue(
                    'error',
                    element,
                    'Duplicate id "' + id + '" found on the page.',
                    'Ensure every id value is unique.'
                );
            });
        }

        report() {
            const errors = this.issues.filter((issue) => issue.type === 'error');
            const warnings = this.issues.filter((issue) => issue.type === 'warning');

            console.group('Accessibility helper results');
            console.info('These results are heuristic only and do not replace manual testing or a full audit.');

            if (!this.issues.length) {
                console.info('No obvious issues were found by the helper.');
                console.groupEnd();
                return;
            }

            if (errors.length) {
                console.group('Errors: ' + errors.length);
                errors.forEach((issue) => {
                    console.error(issue.message, issue.element);
                    console.info('Suggestion: ' + issue.suggestion);
                });
                console.groupEnd();
            }

            if (warnings.length) {
                console.group('Warnings: ' + warnings.length);
                warnings.forEach((issue) => {
                    console.warn(issue.message, issue.element);
                    console.info('Suggestion: ' + issue.suggestion);
                });
                console.groupEnd();
            }

            console.groupEnd();
        }

        static shouldAutoRun() {
            const params = new URLSearchParams(window.location.search);
            const hostname = window.location.hostname;
            const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
            const isFileProtocol = window.location.protocol === 'file:';

            return params.has('a11y-debug') || isLocalHost || isFileProtocol;
        }
    }

    window.AccessibilityChecker = AccessibilityChecker;

    if (AccessibilityChecker.shouldAutoRun()) {
        const runChecker = function () {
            new AccessibilityChecker(document).run();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runChecker);
        } else {
            runChecker();
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AccessibilityChecker;
    }
})();
