import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";

import {
    getCurrentProjectId,
    setCurrentProjectId
} from "../../shared/project/project.context.js";

import {
    getBOQProgressSummary,
    getProgressEntries,
    createProgress,
    updateProgress,
    getProgressById,
    approveProgress,
    rejectProgress
} from "./progress.service.js";

import { getTranslation } from "../../shared/localization/i18n.js";
import { showSuccess, showError } from "../../shared/ui/toast.js";
import { showAlert, hideAlert } from "../../shared/ui/alert.js";
import { showConfirm } from "../../shared/ui/confirm.js";

import {
    formatQuantity,
    formatPercentage,
    formatDate
} from "../../shared/utils/format.js";

import { initializeTooltips } from "../../shared/ui/tooltip.js";

let progressModal;
let progressDetailsModal;
let currentProgressId;

initializeProgress();

async function initializeProgress() {
    setCurrentProjectId(1);
    requireAuthentication();

    await initializeLayout();

    initializeProgressModal();
    initializeProgressDetailsModal();

    bindEvents();

    await loadProgressSummary();
    await loadProgressEntries();
}

function initializeProgressModal() {
    const modalElement = document.getElementById("progressModal");
    progressModal = new coreui.Modal(modalElement);
}

function bindEvents() {

    document.getElementById("progressForm")
        .addEventListener("submit", handleProgressFormSubmit);

    document.getElementById("progressSummaryTableBody")
        .addEventListener("click", handleSummaryTableClick);

    document.getElementById("progressEntriesTableBody")
        .addEventListener("click", handleProgressEntriesTableClick);

    document.getElementById("rejectProgressButton")
        .addEventListener("click", enableRejectComment);

    document.getElementById("approveProgressButton")
        .addEventListener("click", handleApproveProgress);

    document.getElementById("rejectProgressButton")
        .addEventListener("click", handleRejectProgress);

}

async function handleProgressFormSubmit(event) {

    event.preventDefault();

    const progressId = document.getElementById("progressId").value;
    const boqItemId = Number(document.getElementById("progressBOQItemId").value);
    const isEdit = Boolean(progressId);

    const progress = {

        quantityDone: Number(document.getElementById("quantityDone").value),
        executionDate: document.getElementById("executionDate").value,
        notes: document.getElementById("progressNotes").value.trim() || null

    };

    const saveButton = document.getElementById("saveProgressButton");
    const spinner = document.getElementById("saveProgressSpinner");

    saveButton.disabled = true;
    spinner.classList.remove("d-none");

    hideAlert("progressAlert");

    try {

        if (isEdit) {
            await updateProgress(Number(progressId), progress);
        }
        else {
            await createProgress(boqItemId, progress);
        }

        progressModal.hide();

        clearProgressForm();

        await loadProgressSummary();
        await loadProgressEntries();

        showSuccess(
            isEdit
                ? getTranslation("progress.messages.updatedSuccessfully") ?? "Progress updated successfully."
                : getTranslation("progress.messages.createdSuccessfully") ?? "Progress recorded successfully."
        );

    }
    catch (error) {

        if (error.errors) {
            const validationMessage = Object.values(error.errors)[0][0];
            showAlert("progressAlert", validationMessage);
        }
        else {
            showAlert("progressAlert", error.message);
        }

    }
    finally {
        saveButton.disabled = false;
        spinner.classList.add("d-none");
    }

}

function clearProgressForm() {
    document.getElementById("progressForm").reset();
    document.getElementById("progressId").value = "";
    document.getElementById("progressBOQItemId").value = "";
}

function handleSummaryTableClick(event) {

    const button = event.target.closest(".progress-add-button");

    if (!button) {
        return;
    }

    const row = button.closest("tr");
    const boqItemId = Number(button.dataset.boqItemId);
    openCreateProgressModal(boqItemId, row);

}

function openCreateProgressModal(boqItemId, row) {

    hideAlert("progressAlert");

    clearProgressForm();

    document.getElementById("progressBOQItemId").value = boqItemId;

    const itemNumber = row.cells[1].textContent.trim();
    const itemName = row.cells[2].textContent.trim();
    const unit = row.cells[3].textContent.trim();

    document.getElementById("progressBOQItemInfo").textContent = `${itemNumber} - ${itemName} (${unit})`;
    document.getElementById("progressModalTitle").textContent = getTranslation("progress.modal.addTitle") ?? "Record Progress";
    document.getElementById("saveProgressButtonText").textContent = getTranslation("progress.modal.create") ?? "Record";

    progressModal.show();

}


function initializeProgressDetailsModal() {
    const modalElement = document.getElementById("progressDetailsModal");
    progressDetailsModal = new coreui.Modal(modalElement);
}

function handleProgressEntriesTableClick(event) {

    const viewButton = event.target.closest(".progress-view-button");

    if (viewButton ) {
        const progressId = Number(viewButton.dataset.progressId);
        openProgressDetailsModal(progressId);
        return;
    }

    const editButton = event.target.closest(".progress-edit-button");

    if (editButton) {
        const progressId = Number(editButton.dataset.progressId);
        openEditProgressModal(progressId);
        return;
    }
}

async function openEditProgressModal(progressId) {

    try {

        hideAlert("progressAlert");

        const progress = await getProgressById(progressId);

        document.getElementById("progressId").value = progress.id;
        document.getElementById("quantityDone").value = progress.quantityDone;
        document.getElementById("executionDate").value = progress.executionDate;    
        document.getElementById("progressNotes").value = progress.notes ?? "";
        document.getElementById("progressBOQItemInfo").textContent = `${progress.itemNumber} - ${progress.itemName}`;
        document.getElementById("progressModalTitle").textContent = getTranslation("progress.modal.editTitle") ?? "Edit Progress";
        document.getElementById("saveProgressButtonText").textContent = getTranslation("progress.modal.update") ?? "Update";

        progressModal.show();

    }
    catch (error) {
        showError(error.message);
    }

}

async function openProgressDetailsModal(progressId) {

    try {

        hideAlert("progressDetailsAlert");

        const progress = await getProgressById(progressId);

         currentProgressId = progressId;

        document.getElementById("detailsBOQItemInfo").textContent = `${progress.itemNumber} - ${progress.itemName}`;

        const statusElement = document.getElementById("detailsProgressStatus");

        statusElement.textContent = getTranslation(`common.${progress.status.toLowerCase()}`)
            ?? progress.status;

        document.getElementById("detailsQuantityDone").textContent = formatQuantity(progress.quantityDone);
        document.getElementById("detailsExecutionDate").textContent = formatDate(progress.executionDate);
        document.getElementById("detailsSiteNotes").textContent = progress.notes ?? "";

        const reviewerCommentInput = document.getElementById("detailsReviewerComment");
        reviewerCommentInput.value = progress.reviewerComment ?? "";
        reviewerCommentInput.readOnly = progress.status !== "Pending";

        const approveButton = document.getElementById("approveProgressButton");
        const rejectButton = document.getElementById("rejectProgressButton");

        if (progress.status === "Pending") {
            approveButton.classList.remove("d-none");
            rejectButton.classList.remove("d-none");
        }
        else {
            approveButton.classList.add("d-none");
            rejectButton.classList.add("d-none");
        }

        progressDetailsModal.show();

    }
    catch (error) {
        showError(error.message);
    }

}

function enableRejectComment() {
    const reviewerComment = document.getElementById("detailsReviewerComment");
    reviewerComment.readOnly = false;
    reviewerComment.focus();
}

async function handleApproveProgress() {

    try {
        progressDetailsModal.hide();

        const confirmed = await showConfirm({

            title: getTranslation("progress.confirm.approveTitle") ?? "Approve Execution Record",
            message: getTranslation("progress.confirm.approveMessage") 
                ?? "Are you sure you want to approve this execution record? Approved quantities will be updated after approval.",
            confirmText: getTranslation("progress.confirm.approveButton") ?? "Approve",
            cancelText: getTranslation("common.cancel") ?? "Cancel",

            confirmButtonClass: "btn-success"

        });

        if (!confirmed) {
             progressDetailsModal.show();
            return;
        }

        await approveProgress(currentProgressId);
        await loadProgressSummary();
        await loadProgressEntries();

        showSuccess( getTranslation("progress.messages.approvedSuccessfully") ?? "Execution record approved successfully");
    }
    catch (error) {

        progressDetailsModal.show();
        showError(error.message);
    }

}

async function loadProgressSummary() {

    const projectId = getCurrentProjectId();

    try {
        const summary = await getBOQProgressSummary(projectId);
        renderProgressSummary(summary);
        document.getElementById("progressItemsCount").textContent = summary.length;
    }
    catch (error) {
        showError(error.message);
    }

}

async function handleRejectProgress() {

    const reviewerComment = document.getElementById("detailsReviewerComment").value.trim();

    if (!reviewerComment) {
        showAlert("progressDetailsAlert", getTranslation("progress.messages.reviewerCommentRequired") ?? "Reviewer comment is required.");
        return;
    }

    progressDetailsModal.hide();

    const confirmed = await showConfirm({

        title: getTranslation("progress.confirm.rejectTitle") ?? "Reject Execution Record",
        message: getTranslation("progress.confirm.rejectMessage") 
            ?? "Are you sure you want to reject this execution record? The record will be returned for modification.",
        confirmText: getTranslation("common.reject") ?? "Reject",
        cancelText: getTranslation("common.cancel") ?? "Cancel",
        confirmButtonClass: "btn-danger"

    });

    if (!confirmed) {
        progressDetailsModal.show();
        return;
    }
    try {

        await rejectProgress(currentProgressId, { reviewerComment });
        await loadProgressSummary();
        await loadProgressEntries();

        showSuccess(getTranslation("progress.messages.rejectedSuccessfully") ?? "Execution record rejected successfully");
    }
    catch (error) {
        progressDetailsModal.show();
        showError(error.message);
    }
}

function renderProgressSummary(summary) {

    const tableBody = document.getElementById("progressSummaryTableBody");
    tableBody.replaceChildren();

    document.getElementById("progressItemsCount").textContent = summary.length;

    let index = 1;

    for (const item of summary) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index++}</td>
            <td>${item.itemNumber}</td>
            <td>${item.itemName}</td>
            <td>${item.unit}</td>
            <td>${formatQuantity(item.contractQuantity)}</td>
            <td>${formatQuantity(item.executedQuantity)}</td>
            <td>${formatQuantity(item.remainingQuantity)}</td>
            <td>${formatPercentage(item.progressPercentage)}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary progress-add-button"
                    data-boq-item-id="${item.boqItemId}"
                    data-coreui-toggle="tooltip"
                    data-coreui-placement="top"
                    title="${getTranslation("progress.table.recordProgress") ?? "Record Progress"}">
                    <i class="cil-plus"></i>
                </button>
            </td>

        `;
        tableBody.appendChild(row);
    }
}

async function loadProgressEntries() {

    const projectId = getCurrentProjectId();

    try {
        const entries = await getProgressEntries(projectId);
        renderProgressEntries(entries);
    }
    catch (error) {
        showError(error.message);
    }
}

function renderProgressEntries(entries) {

    const tableBody = document.getElementById("progressEntriesTableBody");
    tableBody.replaceChildren();

    let index = 1;

    for (const entry of entries) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index++}</td>

            <td>
                <div class="fw-semibold">${entry.itemNumber}</div>
                <div class="small text-body-secondary">
                    ${entry.itemName}
                </div>
            </td>
            <td>${formatQuantity(entry.quantityDone)}</td>
            <td>${formatDate(entry.executionDate)}</td>
            <td>
                ${renderProgressStatusBadge(entry.status)}
            </td>

            <td>${entry.submittedBy}</td>

            <td>

                <button
                    type="button"
                        class="btn btn-sm btn-outline-info progress-view-button"

                    data-progress-id="${entry.id}"
                    data-coreui-toggle="tooltip"
                    data-coreui-placement="top"
                    title="${getTranslation("common.view") ?? "View"}">

                    <svg xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>


                ${entry.status === "Rejected" ? `

                <button
                    type="button"
                    class="btn btn-sm btn-outline-primary progress-edit-button"
                    data-progress-id="${entry.id}"
                    data-coreui-toggle="tooltip"
                    data-coreui-placement="top"
                    title="${getTranslation("common.edit") ?? "Edit"}">
                    <i class="cil-pencil"></i>
                </button>

                ` : ""}

            </td>
        `;

        tableBody.appendChild(row);

        initializeTooltips();
    }
}

function renderProgressStatusBadge(status) {

    switch (status) {

        case "Pending":

            return `
                <span class="badge bg-warning">
                    ${getTranslation("common.pending") ?? "Pending"}
                </span>
            `;

        case "Approved":

            return `
                <span class="badge bg-success">
                    ${getTranslation("common.approved") ?? "Approved"}
                </span>
            `;

        case "Rejected":

            return `
                <span class="badge bg-danger">
                    ${getTranslation("common.rejected") ?? "Rejected"}
                </span>
            `;

        default:

            return `
                <span class="badge bg-secondary">
                    ${status}
                </span>
            `;
    }

}
