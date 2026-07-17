import ar from "./ar.js";
import {
    getLanguage,
    initializeLanguage
} from "./language.service.js";

export function initializeLocalization() {

    initializeLanguage();

    applyTranslations();

    applyPlaceholders();

}


export function applyTranslations() {

    const elements = document.querySelectorAll("[data-i18n]");

    elements.forEach(element => {

        const key = element.dataset.i18n;

        const translation = getTranslation(key);

        if (translation !== null) {
            element.textContent = translation;
        }

    });

}


export function getTranslation(key) {

    const language = getLanguage();

    if (language === "en") { return null; }

    return key.split(".").reduce((obj, part) => obj?.[part], ar);
}


export function applyPlaceholders() {

    const elements = document.querySelectorAll("[data-i18n-placeholder]");

    elements.forEach(element => {

        const key = element.dataset.i18nPlaceholder;

        const translation = getTranslation(key);

        if (translation !== null) {
            element.placeholder = translation;
        }

    });

}
