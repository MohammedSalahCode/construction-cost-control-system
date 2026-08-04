import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";
import { getCurrentProjectId } from "../../shared/project/project.context.js";
import { getTranslation } from "../../shared/localization/i18n.js";
import { initializeAppLoader, hideAppLoader} from "../../shared/layout/app-loader.js";
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
import { formatQuantity, formatCurrency } from "../../shared/utils/format.js";
import { requireProject } from "../../shared/project/project.guard.js";
import { PROJECT_CHANGED_EVENT } from "../../shared/project/project.events.js";
import { initializeTooltips } from "../../shared/ui/tooltip.js";
import { clearProjectsCache } from "../../shared/services/projects.service.js";

let boqModal;

initializeBOQ();

async function initializeBOQ() {

    initializeAppLoader();

    try {

        requireAuthentication();

        requireProject();

        await initializeLayout();

        initializeBOQModal();

        bindEvents();

        bindProjectEvents();

        await loadBOQItems();
        
        initializeTooltips();
    }
    finally {
        hideAppLoader();
    }
}

function bindProjectEvents() {
    window.addEventListener(PROJECT_CHANGED_EVENT, handleProjectChanged);
}

async function handleProjectChanged() {
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
        title: getTranslation("boq.confirm.lockTitle") ?? "Approve BOQ",
        message: getTranslation("boq.confirm.lockMessage") ??
            "Are you sure you want to approve this BOQ?\nThe project will move to \"In Execution\" status and BOQ items will be locked.\nAfter approval:\n- BOQ items cannot be added, edited, or deleted.\n- Progress tracking and expenses recording can be started.",
        confirmText: getTranslation("boq.confirm.lockButton") ?? "Approve",
        cancelText: getTranslation("boq.confirm.cancelButton") ?? "Cancel",
        confirmButtonClass: "btn-primary"
    });

    if (!confirmed) {
        return;
    }

    try {
        await lockBOQ(projectId);
        clearProjectsCache();

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
    const itemsCountElement = document.getElementById("boqItemsCount");
    const totalValueElement = document.getElementById("boqTotalValue");

    tableBody.replaceChildren();

    itemsCountElement.textContent = boqItems.length;

    const totalBOQValue = boqItems.reduce(
        (total, item) => total + (Number(item.totalPrice) || 0),
        0
    );

    totalValueElement.textContent = formatCurrency(totalBOQValue);
    const hasItems = boqItems.length > 0;
    const isLocked =hasItems && boqItems.every(item => item.isLocked);

    updateBOQLockState(isLocked, hasItems);

    // Empty State
    if (!hasItems) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="8" class="text-center py-5">
                <div class="d-flex flex-column align-items-center">
                    <div class="bg-body-tertiary rounded-circle p-4 mb-3">
                        <i class="cil-list-rich fs-2 text-body-secondary"></i>
                    </div>

                     <h6 class="mb-2">
                        ${getTranslation("boq.messages.noItems") ?? "No BOQ items yet"}
                    </h6>

                    <p class="text-body-secondary mb-0 small">
                        ${getTranslation("boq.messages.noItemsDescription")
                            ?? "Add the first item to start building the project bill of quantities."}
                    </p>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    let index = 1;
    for (const item of boqItems) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="text-center text-body-secondary">${index++}</td>
            <td><span class="fw-semibold">${item.itemNumber}</span></td>
            <td>
                <div
                    class="boq-item-name fw-semibold"
                        data-coreui-toggle="tooltip"
                        data-coreui-placement="top"
                        data-coreui-title="${item.itemName}">
                        ${item.itemName}
                </div>
                ${
                    item.notes
                        ? `
                            <div class="small text-body-secondary text-truncate"
                                 style="max-width: 280px;">
                                ${item.notes}
                            </div>
                          `
                        : ""
                }
            </td>

            <td><span class="badge bg-body-secondary text-body px-2 py-1">${item.unit}</span></td>
            <td class="text-end">${formatQuantity(item.quantity)}</td>
            <td class="text-end">${formatCurrency(item.unitPrice)}</td>
            <td class="text-end"><span class="fw-semibold">${formatCurrency(item.totalPrice)}</span></td>

            <td class="text-center">
                <div class="d-inline-flex gap-1">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary edit-boq-button"
                        data-boq-id="${item.id}"
                        ${isLocked ? "disabled" : ""}
                        data-coreui-toggle="tooltip"
                        data-coreui-placement="top"
                        data-coreui-title="${getTranslation("common.edit") ?? "Edit"}"
                        aria-label="${getTranslation("common.edit") ?? "Edit"}">
                        <i class="cil-pencil"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger delete-boq-button"
                        data-boq-id="${item.id}"
                        ${isLocked ? "disabled" : ""}
                        data-coreui-toggle="tooltip"
                        data-coreui-placement="top"
                        data-coreui-title="${getTranslation("common.delete") ?? "Delete"}"
                        aria-label="${getTranslation("common.delete") ?? "Delete"}">
                        <i class="cil-trash"></i>
                    </button>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    }

    initializeTooltips();
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
        title: getTranslation("boq.confirm.deleteTitle") ?? "Delete BOQ Item",
        message: getTranslation("boq.confirm.deleteMessage") ?? "Are you sure you want to delete this BOQ item? This action cannot be undone.",
        confirmText: getTranslation("boq.confirm.confirmButton") ?? "Delete",
        cancelText: getTranslation("boq.confirm.cancelButton") ?? "Cancel"
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

    // Status badge
    statusBadge.classList.toggle("bg-warning-subtle", !isLocked);
    statusBadge.classList.toggle("text-warning-emphasis", !isLocked);
    statusBadge.classList.toggle("bg-success-subtle", isLocked);
    statusBadge.classList.toggle("text-success-emphasis", isLocked);

    statusBadge.textContent = isLocked
        ? getTranslation("boq.summary.approved") ?? "Approved"
        : getTranslation("boq.summary.draft") ?? "Draft";

    lockButton.disabled = isLocked || !hasItems;
    addButton.disabled = isLocked;    

    // Lock button appearance
    if (isLocked) {

        lockButton.classList.remove("btn-light", "border");
        lockButton.classList.add("bg-success-subtle", "text-success-emphasis", "border-0");

        lockButton.innerHTML = `
            <i class="cil-check-circle me-2"></i>
            <span>${getTranslation("boq.messages.approved") ?? "Approved"}</span>
        `;

    }
    else {

            lockButton.classList.remove("bg-success-subtle", "text-success-emphasis", "border-0");
            lockButton.classList.add("btn-light", "border");

            lockButton.innerHTML = `
                <i class="cil-lock-locked me-2"></i>
                <span>${getTranslation("boq.page.lockButton") ?? "Approve BOQ"}</span>
            `;

    }
}
