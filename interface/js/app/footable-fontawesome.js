/**
 * Replace FooTable Glyphicons with FontAwesome SVG icons
 */
define(["jquery"], ($) => {
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

    return {
        replace: () => {
            // Replace all fooicon elements with FontAwesome SVG
            Object.keys(iconMap).forEach((fooClass) => {
                const faIcon = iconMap[fooClass];
                $(`.${fooClass}`).each(function () {
                    const $el = $(this);
                    // Replace span with i element and update classes
                    const $newEl = $("<i/>").addClass(`fas fa-${faIcon}`);
                    $el.replaceWith($newEl);
                });
            });
        }
    };
});
