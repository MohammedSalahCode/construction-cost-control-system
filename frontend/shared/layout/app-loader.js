import { getLanguage } from "../localization/language.service.js";

export function initializeAppLoader() {

    const loaderText = document.getElementById("loaderText");

    if (!loaderText) {
        return;
    }

    loaderText.textContent =
        getLanguage() === "ar"
            ? "جارٍ تحميل مساحة العمل..."
            : "Loading workspace...";
}

export function hideAppLoader() {

    const loader = document.getElementById("appLoader");

    if (!loader) {
        return;
    }

    loader.classList.add("hidden");
}