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

    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
