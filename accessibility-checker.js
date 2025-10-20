/**
 * Accessibility Checker for Colorado Fabrication Partners Website
 * This script provides basic accessibility validation and testing
 */

class AccessibilityChecker {
    constructor() {
        this.issues = [];
        this.init();
    }

    init() {
        // Run checks when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.runChecks());
        } else {
            this.runChecks();
        }
    }

    runChecks() {
        this.checkImages();
        this.checkHeadings();
        this.checkLinks();
        this.checkButtons();
        this.checkFormElements();
        this.checkColorContrast();
        this.checkKeyboardNavigation();
        this.reportResults();
    }

    checkImages() {
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt || img.alt.trim() === '') {
                this.issues.push({
                    type: 'error',
                    element: img,
                    message: `Image ${index + 1} is missing alt text`,
                    fix: 'Add descriptive alt text to the image'
                });
            }
        });
    }

    checkHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (index === 0 && level !== 1) {
                this.issues.push({
                    type: 'warning',
                    element: heading,
                    message: 'First heading should be h1',
                    fix: 'Change the first heading to h1'
                });
            }
            
            if (level > lastLevel + 1) {
                this.issues.push({
                    type: 'warning',
                    element: heading,
                    message: `Heading level ${level} skips level ${lastLevel + 1}`,
                    fix: 'Use proper heading hierarchy'
                });
            }
            
            lastLevel = level;
        });
    }

    checkLinks() {
        const links = document.querySelectorAll('a');
        links.forEach((link, index) => {
            if (!link.href && !link.getAttribute('role')) {
                this.issues.push({
                    type: 'warning',
                    element: link,
                    message: `Link ${index + 1} has no href attribute`,
                    fix: 'Add href attribute or role="button" for button-like links'
                });
            }
            
            if (link.href === '#' && !link.getAttribute('aria-label')) {
                this.issues.push({
                    type: 'warning',
                    element: link,
                    message: `Link ${index + 1} has empty href`,
                    fix: 'Add aria-label for better accessibility'
                });
            }
        });
    }

    checkButtons() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                this.issues.push({
                    type: 'error',
                    element: button,
                    message: `Button ${index + 1} has no accessible name`,
                    fix: 'Add text content or aria-label'
                });
            }
        });
    }

    checkFormElements() {
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach((input, inputIndex) => {
                if (!input.id && !input.getAttribute('aria-label')) {
                    this.issues.push({
                        type: 'warning',
                        element: input,
                        message: `Form input ${inputIndex + 1} has no accessible name`,
                        fix: 'Add id and label or aria-label'
                    });
                }
            });
        });
    }

    checkColorContrast() {
        // Basic color contrast check - this is a simplified version
        const elements = document.querySelectorAll('h1, h2, h3, p, a, button');
        elements.forEach((element) => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // This is a basic check - in production, use a proper contrast checker
            if (color === backgroundColor) {
                this.issues.push({
                    type: 'error',
                    element: element,
                    message: 'Text and background colors are the same',
                    fix: 'Improve color contrast'
                });
            }
        });
    }

    checkKeyboardNavigation() {
        const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
        let tabIndexValues = [];
        
        focusableElements.forEach((element) => {
            const tabIndex = element.getAttribute('tabindex');
            if (tabIndex) {
                tabIndexValues.push(parseInt(tabIndex));
            }
        });
        
        // Check for duplicate tabindex values
        const duplicates = tabIndexValues.filter((item, index) => tabIndexValues.indexOf(item) !== index);
        if (duplicates.length > 0) {
            this.issues.push({
                type: 'warning',
                element: null,
                message: 'Duplicate tabindex values found',
                fix: 'Ensure unique tabindex values'
            });
        }
    }

    reportResults() {
        if (this.issues.length === 0) {
            console.log('✅ Accessibility check passed! No issues found.');
            return;
        }

        console.group('🔍 Accessibility Check Results');
        
        const errors = this.issues.filter(issue => issue.type === 'error');
        const warnings = this.issues.filter(issue => issue.type === 'warning');
        
        if (errors.length > 0) {
            console.group('❌ Errors (' + errors.length + ')');
            errors.forEach(issue => {
                console.error(issue.message, issue.element);
                console.log('Fix: ' + issue.fix);
            });
            console.groupEnd();
        }
        
        if (warnings.length > 0) {
            console.group('⚠️ Warnings (' + warnings.length + ')');
            warnings.forEach(issue => {
                console.warn(issue.message, issue.element);
                console.log('Fix: ' + issue.fix);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        // Add visual indicator to the page
        this.addVisualIndicator();
    }

    addVisualIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'accessibility-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #dc6f41;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 10000;
            cursor: pointer;
        `;
        indicator.textContent = `Accessibility: ${this.issues.length} issues`;
        indicator.title = 'Click to see accessibility issues in console';
        
        indicator.addEventListener('click', () => {
            this.reportResults();
        });
        
        document.body.appendChild(indicator);
    }
}

// Initialize accessibility checker
const accessibilityChecker = new AccessibilityChecker();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityChecker;
}
