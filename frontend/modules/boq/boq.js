import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";
import {
    getCurrentProjectId,
    setCurrentProjectId
} from "../../shared/project/project.context.js";
import { getTranslation } from "../../shared/localization/i18n.js";
import {
    getBOQItems,
    getBOQItemById,
    createBOQItem,
    updateBOQItem,
    deleteBOQItem,
    lockBOQ 
} from "./boq.service.js";
import { showSuccess, showError } from "../../shared/ui/toast.js";
import { showAlert, hideAlert } from "../../shared/ui/alert.js";
import { showConfirm } from "../../shared/ui/confirm.js";

let boqModal;

initializeBOQ();

async function initializeBOQ() {
    
    setCurrentProjectId(1);

    requireAuthentication();

    await initializeLayout();

    initializeBOQModal();

    bindEvents();

    await loadBOQItems();

}

function initializeBOQModal() {

    const modalElement = document.getElementById("boqModal");

    boqModal = new coreui.Modal(modalElement);

}

function bindEvents() {

    document.getElementById("addBOQItemButton")
        .addEventListener("click", openCreateBOQModal);

    document.getElementById("boqForm")
        .addEventListener("submit", handleBOQFormSubmit);

    document.getElementById("quantity")
        .addEventListener("input", updateTotalPrice);

    document.getElementById("unitPrice")
        .addEventListener("input", updateTotalPrice);

    document.getElementById("lockBOQButton")
        .addEventListener("click", handleLockBOQ);

}

function openCreateBOQModal() {

    hideAlert("boqAlert");

    clearBOQForm();

    document.getElementById("boqModalTitle").textContent = getTranslation("boq.modal.addTitle") ?? "Add BOQ Item";

    document.getElementById("saveBOQButtonText").textContent = getTranslation("boq.modal.create") ?? "Create";

    boqModal.show();

}

async function handleBOQFormSubmit(event) {

    event.preventDefault();

    const projectId = getCurrentProjectId();

    const boqId = document.getElementById("boqId").value;

    const isEdit = Boolean(boqId);

    const boqItem = {

        itemNumber: document.getElementById("itemNumber").value.trim(),
        itemName: document.getElementById("itemName").value.trim(),
        unit: document.getElementById("unit").value.trim(),
        quantity: Number(document.getElementById("quantity").value),
        unitPrice: Number(document.getElementById("unitPrice").value),
        notes: document.getElementById("notes").value.trim() || null

    };

    const saveBOQButton = document.getElementById("saveBOQButton");
    const saveBOQSpinner = document.getElementById("saveBOQSpinner");

    saveBOQButton.disabled = true;
    saveBOQSpinner.classList.remove("d-none");

    hideAlert("boqAlert");

    try {

        if (isEdit) {
            await updateBOQItem(Number(boqId), boqItem);
        }
        else {
            await createBOQItem(projectId, boqItem);
        }

        boqModal.hide();

        clearBOQForm();

        document.getElementById("addBOQItemButton").focus();

        await loadBOQItems();

        showSuccess(
            isEdit
            ? getTranslation("boq.messages.updatedSuccessfully") ?? "BOQ item updated successfully."
            : getTranslation("boq.messages.createdSuccessfully") ?? "BOQ item created successfully."
        );
    }
    catch (error) {

        if (error.errors) {

           const validationMessage = Object.values(error.errors)[0][0];

            showAlert("boqAlert", validationMessage);

        }
        else {

            showAlert("boqAlert", error.message);

        }

    }
    finally {

        saveBOQButton.disabled = false;
        saveBOQSpinner.classList.add("d-none");

    }

}

function updateTotalPrice() {

    const quantity = Number(document.getElementById("quantity").value) || 0;

    const unitPrice = Number(document.getElementById("unitPrice").value) || 0;

    const totalPrice = quantity * unitPrice;

    document.getElementById("totalPrice").textContent = formatCurrency(totalPrice);

}

async function handleLockBOQ() {

    const projectId = getCurrentProjectId();

    const confirmed = await showConfirm({

        title:
            getTranslation("boq.confirm.lockTitle") ?? "Approve BOQ",

        message:
            getTranslation("boq.confirm.lockMessage") ?? "Are you sure you want to approve this BOQ? After approval, you will no longer be able to add, edit, or delete BOQ items.",

        confirmText:
            getTranslation("boq.confirm.lockButton") ?? "Approve",

        cancelText:
            getTranslation("boq.confirm.cancelButton") ?? "Cancel",

        confirmButtonClass: "btn-warning"

    });

    if (!confirmed) {
        return;
    }

    try {

        await lockBOQ(projectId);

        await loadBOQItems();

        showSuccess(

            getTranslation("boq.messages.approvedSuccessfully") ?? "BOQ approved successfully."

        );

    }
    catch (error) {

        showError(error.message);

    }

}

function clearBOQForm() {

    document.getElementById("boqForm").reset();

    document.getElementById("boqId").value = "";

    document.getElementById("totalPrice").textContent = "0.00";

}

async function loadBOQItems() {

    const projectId = getCurrentProjectId();

    if (!projectId) {

        return;

    }

    const boqItems = await getBOQItems(projectId);

    renderBOQItems(boqItems);

    bindBOQActions();

}

function renderBOQItems(boqItems) {

    const tableBody = document.getElementById("boqTableBody");

    tableBody.replaceChildren();

    document.getElementById("boqItemsCount").textContent = boqItems.length;

    const hasItems = boqItems.length > 0;
    const isLocked = hasItems && boqItems.every(item => item.isLocked);

    updateBOQLockState(isLocked, hasItems);

    let index = 1;

    for (const item of boqItems) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index++}</td>
            <td>${item.itemNumber}</td>
            <td>${item.itemName}</td>
            <td>${item.unit}</td>
            <td>${formatQuantity(item.quantity)}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(item.totalPrice)}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary edit-boq-button"
                    data-boq-id="${item.id}"
                    ${isLocked ? "disabled" : ""}>
                    ${getTranslation("common.edit") ?? "Edit"}
                </button>

                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger delete-boq-button ms-1"
                    data-boq-id="${item.id}"
                    ${isLocked ? "disabled" : ""}>
                    ${getTranslation("common.delete") ?? "Delete"}
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    }

}

function formatQuantity(value) {

    return Number(value).toLocaleString();

}

function formatCurrency(value) {

    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

function bindBOQActions() {

    const editButtons = document.querySelectorAll(".edit-boq-button");

    for (const button of editButtons) {

        button.addEventListener("click", handleEditBOQ);

    }

    const deleteButtons = document.querySelectorAll(".delete-boq-button");

    for (const button of deleteButtons) {

        button.addEventListener("click", handleDeleteBOQ);

    }

}

async function handleEditBOQ(event) {

    const boqId = Number(event.currentTarget.dataset.boqId);

    const boqItem = await getBOQItemById(boqId);

    populateBOQForm(boqItem);

    hideAlert("boqAlert");

    boqModal.show();

}

async function handleDeleteBOQ(event) {

    const boqId = Number(event.currentTarget.dataset.boqId);

    const confirmed = await showConfirm({

        title:
            getTranslation("boq.confirm.deleteTitle") ?? "Delete BOQ Item",

        message:
            getTranslation("boq.confirm.deleteMessage") ?? "Are you sure you want to delete this BOQ item? This action cannot be undone.",

        confirmText:
            getTranslation("boq.confirm.confirmButton") ?? "Delete",

        cancelText:
            getTranslation("boq.confirm.cancelButton") ?? "Cancel"

    });

    if (!confirmed) {
        return;
    }

    try {

        await deleteBOQItem(boqId);

        await loadBOQItems();

        showSuccess(

            getTranslation("boq.messages.deletedSuccessfully") ?? "BOQ item deleted successfully."

        );

    }
    catch (error) {

        showError(error.message);

    }

}

function populateBOQForm(boqItem) {

    document.getElementById("boqId").value = boqItem.id;
    document.getElementById("itemNumber").value = boqItem.itemNumber;
    document.getElementById("itemName").value = boqItem.itemName;
    document.getElementById("unit").value = boqItem.unit;
    document.getElementById("quantity").value = boqItem.quantity;
    document.getElementById("unitPrice").value = boqItem.unitPrice;
    document.getElementById("notes").value = boqItem.notes ?? "";

    updateTotalPrice();

    document.getElementById("boqModalTitle").textContent =
        getTranslation("boq.modal.editTitle") ?? "Edit BOQ Item";

    document.getElementById("saveBOQButtonText").textContent =
        getTranslation("boq.modal.saveChanges") ?? "Save Changes";

}

function updateBOQLockState(isLocked, hasItems) {

    const statusBadge = document.getElementById("boqStatusBadge");
    const lockButton = document.getElementById("lockBOQButton");
    const addButton = document.getElementById("addBOQItemButton");

    statusBadge.classList.toggle("bg-warning", !isLocked);
    statusBadge.classList.toggle("bg-success", isLocked);

    statusBadge.textContent = isLocked
        ? getTranslation("boq.summary.approved") ?? "Approved"
        : getTranslation("boq.summary.draft") ?? "Draft";

    lockButton.disabled = isLocked || !hasItems;
    addButton.disabled = isLocked;    

    if (isLocked) {

        lockButton.classList.remove("btn-outline-warning");
        lockButton.classList.add("btn-outline-success");

        lockButton.innerHTML = `
            <i class="cil-check-circle me-2"></i>
            ${getTranslation("boq.messages.approved") ?? "BOQ Approved"}
        `;

    }
    else {

        lockButton.classList.remove("btn-outline-success");
        lockButton.classList.add("btn-outline-warning");

        lockButton.innerHTML = `
            <i class="cil-lock-locked me-2"></i>
            <span>${getTranslation("boq.page.lockButton") ?? "Approve BOQ"}</span>
        `;

    }
}
