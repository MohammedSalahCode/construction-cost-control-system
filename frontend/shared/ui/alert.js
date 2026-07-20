export function showAlert(alertId, message, type = "danger") {

    const alert = document.getElementById(alertId);

    if (!alert) {
        return;
    }

    alert.className = `alert alert-${type}`;

    alert.textContent = message;

    alert.classList.remove("d-none");

}

export function hideAlert(alertId) {

    const alert = document.getElementById(alertId);

    if (!alert) {
        return;
    }

    alert.classList.add("d-none");

    alert.textContent = "";

}
