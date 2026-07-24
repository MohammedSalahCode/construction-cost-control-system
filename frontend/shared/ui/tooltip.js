export function initializeTooltips() {

    const tooltipElements = document.querySelectorAll('[data-coreui-toggle="tooltip"]');

    tooltipElements.forEach(element => {
        new coreui.Tooltip(element, {
            boundary: document.body
        });

    });

}