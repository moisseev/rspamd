/**
 * Replace FooTable fooicon elements with FontAwesome SVG icons
 */
define(["jquery", "fontawesome"], ($, FontAwesome) => {
    "use strict";

    // Icon mapping from FooTable classes to FontAwesome icon definitions
    const iconMap = {
        "fooicon-loader": ["fas", "spinner"],
        "fooicon-plus": ["fas", "plus"],
        "fooicon-minus": ["fas", "minus"],
        "fooicon-search": ["fas", "search"],
        "fooicon-remove": ["fas", "times"],
        "fooicon-sort": ["fas", "sort"],
        "fooicon-sort-asc": ["fas", "sort-up"],
        "fooicon-sort-desc": ["fas", "sort-down"],
        "fooicon-pencil": ["fas", "pencil-alt"],
        "fooicon-trash": ["fas", "trash-alt"],
        "fooicon-eye-close": ["fas", "eye-slash"],
        "fooicon-flash": ["fas", "bolt"],
        "fooicon-cog": ["fas", "cog"],
        "fooicon-stats": ["fas", "chart-bar"]
    };

    let observer = null;

    /**
     * Process a single fooicon element and replace with SVG
     */
    function processIcon(element) {
        const $el = $(element);

        // Find which fooicon-* class this element has
        const classList = element.className.split(/\s+/);
        const fooClass = classList.find((cls) => cls.startsWith("fooicon-") && iconMap[cls]);

        if (!fooClass) return;

        // Check if already processed with this icon
        const currentIcon = $el.data("fa-current-icon");
        if (currentIcon === fooClass) return;

        const [prefix, iconName] = iconMap[fooClass];

        try {
            // Create FontAwesome SVG icon
            const iconDef = FontAwesome.icon({prefix, iconName});

            // Replace element content with SVG
            const [node] = iconDef.node;
            $el.empty().append(node);

            // Mark as processed with current icon type
            $el.data("fa-current-icon", fooClass);
        } catch (e) {
            // Ignore icon creation errors silently
        }
    }

    /**
     * Process all existing fooicon elements in the document
     */
    function processAllIcons() {
        document.querySelectorAll(".fooicon[class*='fooicon-']").forEach(processIcon);
    }

    /**
     * Initialize the MutationObserver to watch for icon changes
     */
    function initObserver() {
        if (observer) return; // Already initialized

        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Handle added nodes
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself is a fooicon
                            if (node.classList && node.classList.contains("fooicon")) {
                                processIcon(node);
                            }
                            // Check for fooicon descendants
                            if (node.querySelectorAll) {
                                node.querySelectorAll(".fooicon[class*='fooicon-']").forEach(processIcon);
                            }
                        }
                    });
                }

                // Handle class attribute changes (e.g., sort icon toggling)
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const {target} = mutation;
                    if (target.classList && target.classList.contains("fooicon")) {
                        processIcon(target);
                    }
                }
            });
        });

        // Observe the entire document for maximum coverage
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    /*
     * Public API
     */

    return {

        /**
         * Initialize icon replacement globally
         * Should be called once when the app starts
         */
        init: () => {
            // Process any existing icons
            processAllIcons();

            // Start observing for future changes
            initObserver();
        },

        /**
         * Manually process icons in a specific container
         * Useful for immediate processing without waiting for observer
         */
        process: (container) => {
            const $container = (typeof container === "string") ? $(container) : container;
            $container.find(".fooicon[class*='fooicon-']").each(function () {
                processIcon(this);
            });
        },

        /**
         * Destroy the observer (cleanup)
         */
        destroy: () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    };
});
