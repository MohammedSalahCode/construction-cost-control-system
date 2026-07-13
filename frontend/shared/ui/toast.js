import { appConfig } from "../config/app.config.js";

function showToast(message, type) {

    const container = document.getElementById("toastContainer");

    if (!container) {
        return;
    }

    const toastElement = document.createElement("div");
    toastElement.className = `toast align-items-center text-bg-${type} border-0`;

    toastElement.setAttribute("role", "alert");
    toastElement.setAttribute("aria-live", "assertive");
    toastElement.setAttribute("aria-atomic", "true");

    toastElement.innerHTML = `
    <div class="d-flex">

        <div class="toast-body">
            ${message}
        </div>

        <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            data-coreui-dismiss="toast"
            aria-label="Close">
        </button>

    </div>
    `;

    
    container.appendChild(toastElement);

    const toast = new coreui.Toast(toastElement, {
        autohide: true,
        delay: appConfig.ui.toastDuration
    });

    toast.show();


    toastElement.addEventListener("hidden.coreui.toast", () => {

        toastElement.remove();

    });

}

export function showSuccess(message) {

    showToast(message, "success");

}

export function showError(message) {

    showToast(message, "danger");

}

export function showWarning(message) {

    showToast(message, "warning");

}

export function showInfo(message) {

    showToast(message, "info");

}