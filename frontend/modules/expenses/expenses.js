import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";

import {
    getCurrentProjectId,
    setCurrentProjectId
} from "../../shared/project/project.context.js";

import {
    getBOQExpenseSummary,
    getExpenses,
    createExpense,
    updateExpense,
    getExpenseById,
    approveExpense,
    rejectExpense
} from "./expenses.service.js";

import { getTranslation } from "../../shared/localization/i18n.js";
import { showSuccess, showError } from "../../shared/ui/toast.js";
import { showAlert, hideAlert } from "../../shared/ui/alert.js";
import { showConfirm } from "../../shared/ui/confirm.js";

import {
    formatQuantity,
    formatCurrency,
    formatDate
} from "../../shared/utils/format.js";

import { initializeTooltips } from "../../shared/ui/tooltip.js";

let directExpenseModal;
let generalExpenseModal;
let expenseDetailsModal;

let currentExpenseId;

initializeExpenses();

async function initializeExpenses() {
    setCurrentProjectId(1);
    requireAuthentication();

    await initializeLayout();

    initializeDirectExpenseModal();
    initializeGeneralExpenseModal();
    initializeExpenseDetailsModal();

    bindEvents();

    await loadExpenseSummary();
    await loadExpenses();
}

function initializeDirectExpenseModal() {
    const modalElement = document.getElementById("directExpenseModal");
    directExpenseModal = new coreui.Modal(modalElement);
}

function initializeGeneralExpenseModal() {
    const modalElement = document.getElementById("generalExpenseModal");
    generalExpenseModal = new coreui.Modal(modalElement);
}

function initializeExpenseDetailsModal() {
    const modalElement = document.getElementById("expenseDetailsModal");
    expenseDetailsModal = new coreui.Modal(modalElement);
}

function bindEvents() {

    document.getElementById("directExpenseForm")
        .addEventListener("submit", handleDirectExpenseFormSubmit);

    document.getElementById("generalExpenseForm")
        .addEventListener("submit", handleGeneralExpenseFormSubmit);

    document.getElementById("expenseSummaryTableBody")
        .addEventListener("click", handleExpenseSummaryTableClick);

    document.getElementById("expensesTableBody")
        .addEventListener("click", handleExpenseTableClick);

    document.getElementById("recordGeneralExpenseButton")
        .addEventListener("click", openGeneralExpenseModal);

    document.getElementById("approveExpenseButton")
        .addEventListener("click", handleApproveExpense);

    document.getElementById("rejectExpenseButton")
        .addEventListener("click", enableRejectComment);

    document.getElementById("rejectExpenseButton")
        .addEventListener("click", handleRejectExpense);

}

async function handleDirectExpenseFormSubmit(event) {

    event.preventDefault();

    const expenseId = document.getElementById("directExpenseId").value;
    const boqItemId = Number(document.getElementById("directExpenseBOQItemId").value);
    const projectId = getCurrentProjectId();

    const isEdit = Boolean(expenseId);

    const expense = {
        amount: Number(document.getElementById("directExpenseAmount").value),
        expenseType: "Direct",
        boqItemId: boqItemId,
        expenseDate: document.getElementById("directExpenseDate").value,
        referenceNumber: document.getElementById("directExpenseReferenceNumber").value.trim() || null,
        description: document.getElementById("directExpenseDescription").value.trim() || null
    };

    const saveButton = document.getElementById("saveDirectExpenseButton");
    const spinner = document.getElementById("saveDirectExpenseSpinner");

    saveButton.disabled = true;
    spinner.classList.remove("d-none");

    hideAlert("directExpenseAlert");

    try {

        if (isEdit) {
            await updateExpense(Number(expenseId), expense);
        } else {
            await createExpense(projectId, expense);
        }

        directExpenseModal.hide();

        clearDirectExpenseForm();

        await loadExpenseSummary();
        await loadExpenses();

        showSuccess(
            isEdit
                ? getTranslation("expenses.messages.updatedSuccessfully") ?? "Expense updated successfully."
                : getTranslation("expenses.messages.createdSuccessfully") ?? "Expense recorded successfully."
        );

    }
    catch (error) {

        if (error.errors) {
            const validationMessage = Object.values(error.errors)[0][0];
            showAlert("directExpenseAlert", validationMessage);

        } else {
            showAlert("directExpenseAlert", error.message);
        }
    }
    finally {
        saveButton.disabled = false;
        spinner.classList.add("d-none");
    }
}

function clearDirectExpenseForm() {
    document.getElementById("directExpenseForm").reset();
    document.getElementById("directExpenseId").value = "";
    document.getElementById("directExpenseBOQItemId").value = "";
}

function handleExpenseSummaryTableClick(event) {

    const button = event.target.closest(".expense-add-button");

    if (!button) {
        return;
    }

    const row = button.closest("tr");
    const boqItemId = Number(button.dataset.boqItemId);

    openCreateDirectExpenseModal(boqItemId, row);
}

function openCreateDirectExpenseModal(boqItemId, row) {

    hideAlert("directExpenseAlert");

    clearDirectExpenseForm();

    document.getElementById("directExpenseBOQItemId").value = boqItemId;

    const itemNumber = row.cells[1].textContent.trim();
    const itemName = row.cells[2].textContent.trim();

    document.getElementById("directExpenseBOQItemInfo").textContent = `${itemNumber} - ${itemName}`;
    document.getElementById("directExpenseModalTitle").textContent = getTranslation("expenses.modal.directTitle") ?? "Record Expense";
    document.getElementById("saveDirectExpenseButtonText").textContent = getTranslation("expenses.modal.create") ?? "Save";

    directExpenseModal.show();

}


function handleExpenseTableClick(event) {

    const viewButton = event.target.closest(".expense-view-button");

    if (viewButton) {
        const expenseId = Number(viewButton.dataset.expenseId);
        openExpenseDetailsModal(expenseId);
        return;
    }

    const editButton = event.target.closest(".expense-edit-button");

    if (editButton) {

        const expenseId = Number(editButton.dataset.expenseId);
        const expenseType = editButton.dataset.expenseType;

        if (expenseType === "Direct") {
            openEditDirectExpenseModal(expenseId);
        } else {
            openEditGeneralExpenseModal(expenseId);
        }

        return;
    }
}

async function openExpenseDetailsModal(expenseId) {

    try {

        hideAlert("expenseDetailsAlert");

        const expense = await getExpenseById(expenseId);

        currentExpenseId = expenseId;

        const boqCard = document.getElementById("expenseDetailsBOQCard");

        if (expense.expenseType === "Direct") {
            boqCard.classList.remove("d-none");
            document.getElementById("expenseDetailsBOQItemInfo").textContent = `${expense.itemNumber} - ${expense.itemName}`;
        } else {
            boqCard.classList.add("d-none");
        }

        document.getElementById("expenseDetailsType").textContent = getExpenseTypeText(expense.expenseType);
        document.getElementById("expenseDetailsAmount").textContent = formatCurrency(expense.amount);
        document.getElementById("expenseDetailsDate").textContent = formatDate(expense.expenseDate);
        document.getElementById("expenseDetailsReferenceNumber").textContent = expense.referenceNumber ?? "-";
        document.getElementById("expenseDetailsDescription").textContent = expense.description ?? "";

        const statusElement = document.getElementById("expenseDetailsStatus");

        statusElement.textContent = getTranslation(`common.${expense.status.toLowerCase()}`) ?? expense.status;

        const reviewerComment = document.getElementById("expenseReviewerComment");

        reviewerComment.value = expense.reviewerComment ?? "";
        reviewerComment.readOnly = expense.status !== "Pending";

        const approveButton = document.getElementById("approveExpenseButton");
        const rejectButton = document.getElementById("rejectExpenseButton");

        if (expense.status === "Pending") {
            approveButton.classList.remove("d-none");
            rejectButton.classList.remove("d-none");
        } else {
            approveButton.classList.add("d-none");
            rejectButton.classList.add("d-none");
        }

        expenseDetailsModal.show();
    }
    catch (error) {
        showError(error.message);
    }

}

function enableRejectComment() {
    const reviewerComment = document.getElementById("expenseReviewerComment");
    reviewerComment.readOnly = false;
    reviewerComment.focus();
}

async function handleApproveExpense() {

    try {
        expenseDetailsModal.hide();

        const confirmed = await showConfirm({
            title: getTranslation("expenses.confirm.approveTitle") ?? "Approve Expense",
            message: getTranslation("expenses.confirm.approveMessage") ?? "Are you sure you want to approve this expense request?",
            confirmText: getTranslation("common.approve") ?? "Approve",
            cancelText: getTranslation("common.cancel") ?? "Cancel",
            confirmButtonClass: "btn-success"
        });

        if (!confirmed) {
            expenseDetailsModal.show();
            return;
        }

        await approveExpense(currentExpenseId);

        await loadExpenseSummary();
        await loadExpenses();

        showSuccess(
            getTranslation("expenses.messages.approvedSuccessfully") ?? "Expense approved successfully."
        );
    }
    catch (error) {
        expenseDetailsModal.show();
        showError(error.message);
    }

}

async function handleRejectExpense() {

    const reviewerComment = document.getElementById("expenseReviewerComment").value.trim();

    if (!reviewerComment) {
        showAlert(
            "expenseDetailsAlert",
            getTranslation("expenses.messages.reviewerCommentRequired") ?? "Reviewer comment is required."
        );

        return;
    }

    expenseDetailsModal.hide();

    const confirmed = await showConfirm({
        title: getTranslation("expenses.confirm.rejectTitle") ?? "Reject Expense",
        message: getTranslation("expenses.confirm.rejectMessage") ?? "Are you sure you want to reject this expense request?",
        confirmText: getTranslation("common.reject") ?? "Reject",
        cancelText: getTranslation("common.cancel") ?? "Cancel",
        confirmButtonClass: "btn-danger"
    });

    if (!confirmed) {
        expenseDetailsModal.show();
        return;
    }
    try {
        await rejectExpense(currentExpenseId, { reviewerComment });

        await loadExpenseSummary();
        await loadExpenses();

        showSuccess(
            getTranslation("expenses.messages.rejectedSuccessfully")
            ?? "Expense rejected successfully."
        );

    }
    catch (error) {
        expenseDetailsModal.show();
        showError(error.message);
    }
}

async function loadExpenseSummary() {

    const projectId = getCurrentProjectId();

    try {
        const summary = await getBOQExpenseSummary(projectId);
        renderExpenseSummary(summary);
        document.getElementById("expenseItemsCount").textContent = summary.length;
    }
    catch (error) {
        showError(error.message);
    }

}

function renderExpenseSummary(summary) {

    const tableBody = document.getElementById("expenseSummaryTableBody");

    tableBody.replaceChildren();

    document.getElementById("expenseItemsCount").textContent = summary.length;

    let index = 1;

    for (const item of summary) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index++}</td>
            <td>${item.itemNumber}</td>
            <td>${item.itemName}</td>
            <td>${item.unit}</td>
            <td>${item.contractQuantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(item.contractValue)}</td>
            <td>${renderExpenseRatioCell(item.totalApprovedExpenses, item.contractValue)}</td>

            <td>
                <button
                    type="button"
                    class="btn btn-outline-primary btn-sm px-2 py-1 expense-add-button"
                    data-boq-item-id="${item.boqItemId}">
                    <i class="cil-plus"></i>
                    ${getTranslation("expenses.modal.directTitle") ?? "Record Direct Expense"}
                    </span>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    }

    initializeTooltips();

}




function renderExpenseRatioCell(totalApproved, contractValue) {

    if (contractValue === 0) {
        return `${formatCurrency(totalApproved)} ${getTranslation("currency.symbol") ?? "SAR"}`;
    }

    const ratio = (totalApproved / contractValue) * 100;

    let colorClass = "text-success";

    if (ratio >= 90) {
        colorClass = "text-danger";
    }
    else if (ratio >= 70) {
        colorClass = "text-warning";
    }

    return `
        <div>
            <div>
                ${getTranslation("currency.symbol") ?? "SAR"} ${formatCurrency(totalApproved)}
            </div>
            <small class="${colorClass}">
                ${ratio.toFixed(0)}%
                ${getTranslation("expenses.details.ofItemValue") ?? "of Item Value"}
            </small>
        </div>
    `;
}

async function loadExpenses() {
    const projectId = getCurrentProjectId();

    try {
        const expenses = await getExpenses(projectId);
        renderExpenses(expenses);
    }
    catch (error) {
        showError(error.message);
    }
}

function renderExpenses(expenses) {

    const tableBody = document.getElementById("expensesTableBody");

    tableBody.replaceChildren();

    let index = 1;

    for (const expense of expenses) {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${index++}</td>
            <td>
                ${
                    expense.itemNumber
                        ? `
                            <div class="small text-body-secondary">${expense.itemNumber}</div>
                            <div class="fw-semibold">
                                ${expense.itemName}
                            </div>
                          `
                        : "-"
                }
            </td>
            <td>
                <span style="font-size:0.92rem;">
                    ${getExpenseTypeText(expense.expenseType)}
                </span>
            </td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${formatDate(expense.expenseDate)}</td>
            <td>${renderExpenseStatusBadge(expense.status)}</td>
            <td>${expense.submittedBy}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-info expense-view-button"
                    data-expense-id="${expense.id}"
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
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>

                ${expense.status === "Rejected" ? `

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary expense-edit-button"
                        data-expense-id="${expense.id}"
                        data-expense-type="${expense.expenseType}"
                        data-coreui-toggle="tooltip"
                        data-coreui-placement="top"
                        title="${getTranslation("common.edit") ?? "Edit"}">
                        <i class="cil-pencil"></i>
                    </button>
                ` : ""}
            </td>
        `;
        tableBody.appendChild(row);
    }

    initializeTooltips();
}

function renderExpenseStatusBadge(status) {
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

function getExpenseTypeText(type) {
    switch (type) {

        case "Direct":
            return getTranslation("expenses.modal.direct") ?? "Direct";

        case "Indirect":
            return getTranslation("expenses.modal.indirect") ?? "Indirect";

        case "Overhead":
            return getTranslation("expenses.modal.overhead") ?? "Overhead";

        default:
            return type;
    }
}

async function openEditDirectExpenseModal(expenseId) {

    try {

        hideAlert("directExpenseAlert");

        const expense = await getExpenseById(expenseId);
        document.getElementById("directExpenseId").value = expense.id;
        document.getElementById("directExpenseBOQItemId").value = expense.boqItemId;
        document.getElementById("directExpenseBOQItemInfo").textContent = `${expense.itemNumber} - ${expense.itemName}`;
        document.getElementById("directExpenseAmount").value = expense.amount;
        document.getElementById("directExpenseDate").value = expense.expenseDate;
        document.getElementById("directExpenseReferenceNumber").value = expense.referenceNumber ?? "";
        document.getElementById("directExpenseDescription").value = expense.description ?? "";
        document.getElementById("directExpenseModalTitle").textContent = getTranslation("expenses.modal.editDirectTitle") ?? "Edit Direct Expense";
        document.getElementById("saveDirectExpenseButtonText").textContent = getTranslation("common.update") ?? "Update";

        directExpenseModal.show();
    }
    catch (error) {
        showError(error.message);
    }

}

async function handleGeneralExpenseFormSubmit(event) {

    event.preventDefault();

    const expenseId = document.getElementById("generalExpenseId").value;
    const projectId = getCurrentProjectId();

    const isEdit = Boolean(expenseId);

    const expense = {
        expenseType: document.getElementById("generalExpenseType").value,
        amount: Number(document.getElementById("generalExpenseAmount").value),
        expenseDate: document.getElementById("generalExpenseDate").value,
        referenceNumber: document.getElementById("generalExpenseReferenceNumber").value.trim() || null,
        description: document.getElementById("generalExpenseDescription").value.trim() || null
    };

    const saveButton = document.getElementById("saveGeneralExpenseButton");
    const spinner = document.getElementById("saveGeneralExpenseSpinner");

    saveButton.disabled = true;
    spinner.classList.remove("d-none");

    hideAlert("generalExpenseAlert");

    try {

        if (isEdit) {
            await updateExpense(Number(expenseId), expense);
        }
        else {
            await createExpense(projectId, expense);
        }

        generalExpenseModal.hide();

        clearGeneralExpenseForm();

        await loadExpenseSummary();
        await loadExpenses();

        showSuccess(
            isEdit
                ? getTranslation("expenses.messages.updatedSuccessfully") ?? "Expense updated successfully."
                : getTranslation("expenses.messages.createdSuccessfully") ?? "Expense recorded successfully."
        );

    }
    catch (error) {

        if (error.errors) {
            const validationMessage = Object.values(error.errors)[0][0];
            showAlert("generalExpenseAlert", validationMessage);
        }
        else {
            showAlert("generalExpenseAlert", error.message);
        }

    }
    finally {
        saveButton.disabled = false;
        spinner.classList.add("d-none");
    }

}

function openGeneralExpenseModal() {

    hideAlert("generalExpenseAlert");

    clearGeneralExpenseForm();

    document.getElementById("generalExpenseModalTitle").textContent = getTranslation("expenses.modal.generalTitle") ?? "Record General Expense";
    document.getElementById("saveGeneralExpenseButtonText").textContent = getTranslation("expenses.modal.create") ?? "Save";

    generalExpenseModal.show();
}

function clearGeneralExpenseForm() {
    document.getElementById("generalExpenseForm").reset();
    document.getElementById("generalExpenseId").value = "";

}

async function openEditGeneralExpenseModal(expenseId) {

    try {
        
        hideAlert("generalExpenseAlert");
        
        const expense = await getExpenseById(expenseId);
        
        document.getElementById("generalExpenseId").value = expense.id;
        document.getElementById("generalExpenseType").value = expense.expenseType;
        document.getElementById("generalExpenseAmount").value = expense.amount;
        document.getElementById("generalExpenseDate").value = expense.expenseDate;
        document.getElementById("generalExpenseReferenceNumber").value = expense.referenceNumber ?? "";
        document.getElementById("generalExpenseDescription").value = expense.description ?? "";
        document.getElementById("generalExpenseModalTitle").textContent = getTranslation("expenses.modal.editGeneralTitle") ?? "Edit General Expense";
        document.getElementById("saveGeneralExpenseButtonText").textContent = getTranslation("common.update") ?? "Update";

        generalExpenseModal.show();
    }
    catch (error) {
        showError(error.message);
    }

}
