const LANGUAGE_KEY = "app_language";

export function getLanguage() {

    return localStorage.getItem(LANGUAGE_KEY) || "ar";

}


export function saveLanguage(language) {

    localStorage.setItem(
        LANGUAGE_KEY,
        language
    );

}


export function initializeLanguage() {

    const language = getLanguage();

    document.documentElement.lang = language;

    document.documentElement.dir =
        language === "ar"
            ? "rtl"
            : "ltr";

}


export function setLanguage(language) {

    saveLanguage(language);

    window.location.reload();

}