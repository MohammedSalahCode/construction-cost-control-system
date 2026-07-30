export function showComponentLoader(elementId) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    if (element.querySelector(".component-loader-overlay")) {
        return;
    }

    element.style.position = "relative";

    const overlay = document.createElement("div");

    overlay.className = "component-loader-overlay";

    overlay.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status"></div>
    `;

    element.appendChild(overlay);
}

export function hideComponentLoader(elementId) {

    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    const overlay = element.querySelector(".component-loader-overlay");

    overlay?.remove();
}