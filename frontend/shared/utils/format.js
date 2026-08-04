import { getLanguage } from "../localization/language.service.js";

export function formatQuantity(value) {

    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 3
    });
}

export function formatCurrency(value) {

    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

export function formatPercentage(value) {

    return `${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}%`;

}

export function formatDate(value) {

    if (!value) {
        return "-";
    }

    const language = getLanguage();

    return new Intl.DateTimeFormat(
        language === "ar" ? "ar-SA-u-nu-latn" : "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(new Date(value));
}
