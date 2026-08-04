import { getTranslation } from "../localization/i18n.js";

const messageTranslations = {
    "Start date and end date can only be provided for a custom period.": "costAnalysis.messages.invalidCustomPeriod.startEndOnlyCustom",
    "Start date and end date are required for a custom period.": "costAnalysis.messages.invalidCustomPeriod.startEndRequired",
    "Start date cannot be earlier than the project start date.": "costAnalysis.messages.invalidCustomPeriod.startBeforeProject",
    "Start date cannot be later than end date.": "costAnalysis.messages.invalidCustomPeriod.startAfterEnd",
    "End date cannot be in the future.": "costAnalysis.messages.invalidCustomPeriod.endInFuture",
    "You do not have permission to perform this action.": "common.errors.forbidden"
};

export function getErrorMessage(error) {
    const message = error?.message;
    if (!message) {
        return getTranslation("common.errors.unexpected") ?? "An unexpected error occurred.";
    }

    const translationKey = messageTranslations[message];
    if (translationKey) {
        return getTranslation(translationKey) ?? message;
    }

    return message;
}
