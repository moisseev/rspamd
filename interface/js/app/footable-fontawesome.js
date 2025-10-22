/**
 * Replace FooTable Glyphicons with FontAwesome SVG icons
 */
define(["jquery", "fontawesome"], ($) => {
    "use strict";

    // Icon mapping from FooTable classes to FontAwesome icon names
    const iconMap = {
        "fooicon-loader": "spinner",
        "fooicon-plus": "plus",
        "fooicon-minus": "minus",
        "fooicon-search": "search",
        "fooicon-remove": "times",
        "fooicon-sort": "sort",
        "fooicon-sort-asc": "sort-up",
        "fooicon-sort-desc": "sort-down",
        "fooicon-pencil": "pencil-alt",
        "fooicon-trash": "trash-alt",
        "fooicon-eye-close": "eye-slash",
        "fooicon-flash": "bolt",
        "fooicon-cog": "cog",
        "fooicon-stats": "chart-bar"
    };

    let observer = null;

    function replaceIcon($el) {
        // Get all fooicon-* classes to determine which icon to use
        const classes = $el.attr("class") || "";
        let iconName = null;

        // Find which fooicon class is present
        Object.keys(iconMap).forEach((fooClass) => {
            if (classes.indexOf(fooClass) !== -1) {
                iconName = iconMap[fooClass];
            }
        });

        if (iconName && !$el.data("fa-replaced")) {
            // Mark as replaced to avoid re-processing
            $el.data("fa-replaced", true);
            // Add FontAwesome icon classes while keeping the fooicon class
            // This allows FooTable to continue managing the element
            $el.addClass(`fas fa-${iconName}`);
        }
    }

    function updateIcon($el) {
        // Get current fooicon-* class
        const classes = $el.attr("class") || "";
        let iconName = null;

        Object.keys(iconMap).forEach((fooClass) => {
            if (classes.indexOf(fooClass) !== -1) {
                iconName = iconMap[fooClass];
            }
        });

        if (iconName) {
            // Remove old FontAwesome icon classes
            $el.removeClass((index, className) => (className.match(/\bfa-[\w-]+\b/g) || []).join(" "));
            // Add new FontAwesome icon class
            $el.addClass(`fas fa-${iconName}`);
        }
    }

    function processIcons() {
        $(".fooicon").each(function () {
            const $el = $(this);
            if (!$el.data("fa-replaced")) {
                replaceIcon($el);
            }
        });
    }

    return {
        init: () => {
            // Initial replacement
            processIcons();

            // Set up MutationObserver to watch for class changes and new elements
            observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "class") {
                        const $el = $(mutation.target);
                        if ($el.hasClass("fooicon")) {
                            updateIcon($el);
                        }
                    } else if (mutation.type === "childList") {
                        // Check for newly added fooicon elements
                        $(mutation.addedNodes).find(".fooicon").addBack(".fooicon").each(function () {
                            replaceIcon($(this));
                        });
                    }
                });
            });

            // Observe the entire table container for changes
            $(".footable, .footable-loader").each(function () {
                observer.observe(this, {
                    attributes: true,
                    attributeFilter: ["class"],
                    childList: true,
                    subtree: true
                });
            });
        },
        destroy: () => {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    };
});
