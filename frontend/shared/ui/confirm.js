let confirmModal;

export function showConfirm({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonClass = "btn-danger"
}) {

    const modalElement = document.getElementById("confirmModal");

    if (!modalElement) {
        throw new Error("Shared confirm modal was not found.");
    }

    if (!confirmModal) {
        confirmModal = new coreui.Modal(modalElement);
    }

    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalMessage").textContent = message;
    document.getElementById("confirmCancelButton").textContent = cancelText;

    const confirmButton = document.getElementById("confirmOkButton");
    confirmButton.textContent = confirmText;
    confirmButton.className = `btn ${confirmButtonClass}`;

    return new Promise(resolve => {

        const cancelButton = document.getElementById("confirmCancelButton");

        function onConfirm() {

            cleanup();

            confirmModal.hide();

            resolve(true);

        }

        function onCancel() {

            cleanup();

            resolve(false);

        }

        function cleanup() {

            confirmButton.removeEventListener("click", onConfirm);

            modalElement.removeEventListener("hidden.coreui.modal", onCancel);

        }

        confirmButton.addEventListener("click", onConfirm, { once: true }
        );

        modalElement.addEventListener("hidden.coreui.modal", onCancel, { once: true }
        );

        confirmModal.show();

    });

}
