import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { requireProject } from "../../shared/project/project.guard.js";
import { showSuccess, showError } from "../../shared/ui/toast.js";
import { showAlert, hideAlert } from "../../shared/ui/alert.js";
import { getErrorMessage } from "../../shared/errors/error-message.js";
import { showConfirm } from "../../shared/ui/confirm.js";
import { initializeLayout } from "../../shared/layout/layout.js";
import { getTranslation } from "../../shared/localization/i18n.js";
import { initializeAppLoader, hideAppLoader } from "../../shared/layout/app-loader.js";
import { getCurrentProjectId } from "../../shared/project/project.context.js";
import { PROJECT_CHANGED_EVENT } from "../../shared/project/project.events.js";
import {
    getItemAnalysis,
    createEstimatedCost
} from "./cost-analysis.service.js";
import {
    formatQuantity,
    formatCurrency,
    formatPercentage,
    formatDate
} from "../../shared/utils/format.js";
import {
    showComponentLoader,
    hideComponentLoader
} from "../../shared/ui/component-loader.js";

let allItems = [];
let filteredItems = [];
let currentPeriod = "Cumulative";
let currentFilter = "filterAll";
let customStartDate = null;
let customEndDate = null;
let isCustomDateRangeVisible = false;
let itemAnalysisRequestId = 0;

initializeCostAnalysis();

async function initializeCostAnalysis() {

    initializeAppLoader();

    try {
        requireAuthentication();
        requireProject();
        await initializeLayout();
        bindEvents();
        bindProjectEvents();
        await loadItemAnalysis();
    }
    catch (error) {
        showError(error.message);
    }
    finally {
        hideAppLoader();
    }
}

async function loadItemAnalysis() {
    showComponentLoader("itemAnalysisDataContainer");
    const requestId = ++itemAnalysisRequestId;
    try {
        const projectId = getCurrentProjectId();
        const response = await getItemAnalysis(projectId, currentPeriod, customStartDate, customEndDate);

        // Ignore old response
        if (requestId !== itemAnalysisRequestId) {
            return;
        }

        allItems = response.items;
        document.getElementById("itemAnalysisItemsCount").textContent = allItems.length;
        applyFilter(currentFilter);
        updateItemAnalysisPeriodRange(response.startDate, response.endDate);
    }
    finally {
        hideComponentLoader("itemAnalysisDataContainer");
    }
}

function updateItemAnalysisPeriodRange(startDate, endDate) {
    const periodRange = document.getElementById("itemAnalysisPeriodRange");

    if (!periodRange) {
        return;
    }
    periodRange.textContent =
        `${formatDate(startDate)} — ${formatDate(endDate)}`;
}


function bindEvents() {
    document.getElementById("itemAnalysisFilters")
        .addEventListener("click", handleFilterClick);

    document.getElementById("itemAnalysisPeriods")
        .addEventListener("click", handlePeriodClick);

    document.getElementById("itemAnalysisTableBody")
        .addEventListener("click", handleItemAnalysisTableClick);

    document.getElementById("applyCustomPeriod")
        .addEventListener("click", handleApplyCustomPeriod);
}

function bindProjectEvents() {
    window.addEventListener(PROJECT_CHANGED_EVENT, handleProjectChanged);
}

async function handleProjectChanged() {
    currentPeriod = "Cumulative";
    currentFilter = "filterAll";

    updatePeriodColumnsVisibility();

    customStartDate = null;
    customEndDate = null;

    isCustomDateRangeVisible = false;
    toggleCustomDateRange(false);
    toggleItemAnalysisPeriodRange(true);

    document.querySelectorAll("#itemAnalysisPeriods button")
        .forEach(btn => btn.classList.remove("active"));

    document.querySelector('#itemAnalysisPeriods button[data-period="Cumulative"]')
        ?.classList.add("active");

    document.querySelectorAll("#itemAnalysisFilters button")
        .forEach(btn => btn.classList.remove("active"));

    document.querySelector('#itemAnalysisFilters button#filterAll')
        ?.classList.add("active");

    const periodRange = document.getElementById("itemAnalysisPeriodRange");

    if (periodRange) {
        periodRange.textContent = "";
    }

    try {
        await loadItemAnalysis();
    }
    catch (error) {
        showError(error.message);
    }
}

function handleFilterClick(event) {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    document.querySelectorAll("#itemAnalysisFilters button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    currentFilter = button.id;
    applyFilter(button.id);
}

function applyFilter(filterId) {
    switch (filterId) {

        case "filterAll":
            filteredItems = [...allItems];
            break;

        case "filterOverBudget":
            filteredItems = allItems.filter(item =>
                item.estimatedUnitCost != null &&
                item.periodExecutedQuantity > 0 &&
                item.actualCost > item.periodPlannedCost
            );
            break;

        case "filterCostExceedsRevenue":
            filteredItems = allItems.filter(item =>
                item.periodExecutedQuantity > 0 &&
                item.actualCost > item.earnedRevenue
            );
            break;

        case "filterProgressWithoutCost":
            filteredItems = allItems.filter(item => item.periodProgressPercentage > 0 && item.actualCost === 0);
            break;

        case "filterNoProgressInPeriod":
            filteredItems = allItems.filter(item =>
                item.cumulativeProgressPercentage > 0
                && item.cumulativeProgressPercentage < 100
                && item.periodProgressPercentage === 0);
            break;

        case "filterInProgress":
            filteredItems = allItems.filter(item => item.cumulativeProgressPercentage > 0 && item.cumulativeProgressPercentage < 100);
            break;

        case "filterCompleted":
            filteredItems = allItems.filter(item => item.cumulativeProgressPercentage >= 100);
            break;

        default:
            filteredItems = [...allItems];
            break;
    }

    renderItemAnalysisTable(filteredItems);
}

async function handlePeriodClick(event) {

    const button = event.target.closest("button[data-period]");
    if (!button) {
        return;
    }

    const period = button.dataset.period;
    if (period === "Custom") {

        isCustomDateRangeVisible = !isCustomDateRangeVisible;

        toggleCustomDateRange(isCustomDateRangeVisible);
        toggleItemAnalysisPeriodRange(!isCustomDateRangeVisible);

        document.querySelectorAll("#itemAnalysisPeriods button")
            .forEach(btn => btn.classList.remove("active"));

        if (isCustomDateRangeVisible) {
            button.classList.add("active");
        }
        return;
    }
    hideAlert("customDateAlert");

    currentPeriod = period;
    updatePeriodColumnsVisibility();
    isCustomDateRangeVisible = false;
    toggleCustomDateRange(false);
    toggleItemAnalysisPeriodRange(true);

    document.querySelectorAll("#itemAnalysisPeriods button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    try {
        await loadItemAnalysis();
    }
    catch (error) {
        showError(error.message);
    }
}

function toggleItemAnalysisPeriodRange(show) {
    const container = document.getElementById("itemAnalysisPeriodRangeContainer");
    if (!container) {
        return;
    }

    if (show) {
        container.classList.remove("d-none");
    }
    else {
        container.classList.add("d-none");
    }
}

function toggleCustomDateRange(show) {
    const customDateRange = document.getElementById("customDateRange");

    if (show) {
        customDateRange.classList.add("d-flex");
        customDateRange.classList.remove("d-none");
    }
    else {
        customDateRange.classList.remove("d-flex");
        customDateRange.classList.add("d-none");
    }
}

async function handleApplyCustomPeriod() {
    hideAlert("customDateAlert");
    const startDate = document.getElementById("customStartDate").value;
    const endDate = document.getElementById("customEndDate").value;

    if (!startDate || !endDate) {
        showAlert("customDateAlert", getTranslation("costAnalysis.messages.selectDateRange") ?? "Please select the start and end dates for the custom period");
        return;
    }

    const button = document.getElementById("applyCustomPeriod");
    try {

        button.disabled = true;
        customStartDate = startDate;
        customEndDate = endDate;
        currentPeriod = "Custom";
        updatePeriodColumnsVisibility();

        await loadItemAnalysis();

        toggleItemAnalysisPeriodRange(true);
    }
    catch (error) {
        showAlert("customDateAlert", getErrorMessage(error));
    }
    finally {
        button.disabled = false;
    }
}

function renderItemAnalysisTable(items) {
    const tableBody = document.getElementById("itemAnalysisTableBody");
    tableBody.innerHTML = "";
    if (items.length === 0) {
        const columnCount = document.querySelectorAll("#itemAnalysisTable thead th:not(.d-none)").length;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${columnCount}" class="text-center py-5 text-body-secondary">
                    <i class="cil-list-rich fs-2 d-block mb-3"></i>
                    <div>
                        ${getTranslation("costAnalysis.messages.noItems") ?? "No BOQ items to display"}
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.itemNumber}</td>
            <td>${item.itemName}</td>
            <td>${formatQuantity(item.contractQuantity)}</td>
            <td class="period-column">${formatQuantity(item.periodExecutedQuantity)}</td>
            <td class="period-column">${renderProgressBadge(item.periodProgressPercentage)}</td>
            <td>${formatQuantity(item.cumulativeExecutedQuantity)}</td>
            <td>${renderProgressBadge(item.cumulativeProgressPercentage)}</td>
            <td>${formatCurrency(item.contractValue)}</td>
            <td>${formatCurrency(item.earnedRevenue)}</td>
            <td>
                ${item.estimatedUnitCost == null
                ? `
                            <div class="d-flex align-items-center gap-2 flex-nowrap">
                                <input
                                    type="number"
                                    class="form-control form-control-sm estimated-unit-cost-input"
                                    style="width:80px"
                                    data-boq-item-id="${item.boqItemId}"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01">

                                <button
                                    class="btn btn-sm btn-outline-success save-budget-unit-cost-button"
                                    data-boq-item-id="${item.boqItemId}">
                                    <i class="cil-check"></i>
                                </button>
                            </div>
                        `
                : formatCurrency(item.estimatedUnitCost)
            }
            </td>

            <td>${formatCurrency(item.periodPlannedCost)}</td>
            <td>${formatCurrency(item.actualCost)}</td>
            <td class="${getProfitClass(item.profit)}">
                ${formatCurrency(item.profit)}
            </td>
            <td class="${getProfitClass(item.profitMarginPercentage ?? 0)}">
                ${formatMargin(item.profitMarginPercentage)}
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePeriodColumnsVisibility();
}

function updatePeriodColumnsVisibility() {
    const showPeriodColumns = currentPeriod !== "Cumulative";
    document.querySelectorAll(".period-column").forEach(column => {
        column.classList.toggle("d-none", !showPeriodColumns);
    });
}

function formatMargin(value) {
    if (value === null || value === undefined) {
        return '<span class="d-block text-center fw-semibold">-</span>';
    }
    return formatPercentage(value);
}

function getProfitClass(value) {
    if (value > 0) {
        return "text-success fw-semibold";
    }

    if (value < 0) {
        return "text-danger fw-semibold";
    }

    return "";
}

function renderProgressBadge(progress) {
    let badgeClass = "bg-secondary";
    if (progress === 0) {
        badgeClass = "bg-secondary";
    }
    else if (progress < 100) {
        badgeClass = "bg-info";
    }
    else {
        badgeClass = "bg-success";
    }

    return `
        <span class="badge ${badgeClass} fw-normal">
            ${formatPercentage(progress)}
        </span>
    `;
}

async function handleItemAnalysisTableClick(event) {
    const saveButton = event.target.closest(".save-budget-unit-cost-button");
    if (saveButton) {
        await handleSaveBudgetUnitCost(saveButton);
        return;
    }
}

async function handleSaveBudgetUnitCost(button) {

    const boqItemId = Number(button.dataset.boqItemId);
    const input = document.querySelector(`.estimated-unit-cost-input[data-boq-item-id="${boqItemId}"]`);
    const estimatedUnitCost = Number(input.value);

    if (!estimatedUnitCost || estimatedUnitCost <= 0) {
        showAlert("itemAnalysisAlert", getTranslation("costAnalysis.messages.invalidBudgetUnitCost") ?? "Please enter a valid value.");
        return;
    }

    hideAlert("itemAnalysisAlert");

    const confirmed = await showConfirm({
        title: getTranslation("costAnalysis.confirm.addBudgetTitle") ?? "Add Budget Unit Cost",
        message: getTranslation("costAnalysis.confirm.addBudgetMessage") ?? "The budget unit cost will be saved for this BOQ item. After saving, it cannot be modified from this screen. Do you want to continue?",
        confirmText: getTranslation("common.confirm") ?? "Confirm",
        cancelText: getTranslation("common.cancel") ?? "Cancel"
    });

    if (!confirmed) {
        return;
    }

    try {
        button.disabled = true;
        await createEstimatedCost(boqItemId, estimatedUnitCost);
        hideAlert("itemAnalysisAlert");
        showSuccess(getTranslation("costAnalysis.messages.budgetAdded") ?? "Budget unit cost added successfully.");
        await loadItemAnalysis();
    }
    catch (error) {
        showAlert("itemAnalysisAlert", getErrorMessage(error));
    }
    finally {
        button.disabled = false;
    }
}
