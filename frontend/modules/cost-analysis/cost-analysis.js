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
    getOverview,
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
let overviewRequestId = 0;

initializeCostAnalysis();

async function initializeCostAnalysis() {

    initializeAppLoader();

    try {
        requireAuthentication();
        requireProject();
        await initializeLayout();
        bindEvents();
        bindProjectEvents();
        await loadActiveTab();
    }
    catch (error) {
        showError(error.message);
    }
    finally {
        hideAppLoader();
    }
}

async function loadActiveTab() {
    const activeTab = document.querySelector("#costAnalysisTabs .nav-link.active");

    if (!activeTab) {
        return;
    }

    const targetId = activeTab.getAttribute("data-coreui-target");

    if (targetId === "#overview") {
        await loadOverview();
        return;
    }

    if (targetId === "#item-analysis") {
        await loadItemAnalysis();
        return;
    }

    if (targetId === "#trend") {
        return;
    }

    if (targetId === "#reports") {
        return;
    }
}

async function loadOverview() {
    const container = document.getElementById("overviewDataContainer");
    if (!container) {
        return;
    }

    showComponentLoader("overviewDataContainer");
    setAnalysisControlsDisabled(true);
    const requestId = ++overviewRequestId;

    try {
        const projectId = getCurrentProjectId();
        const response = await getOverview(projectId, currentPeriod, customStartDate, customEndDate);

        // Ignore old response
        if (requestId !== overviewRequestId) {
            return;
        }
        renderOverview(response);
        updateCostAnalysisPeriodRange(response.startDate, response.endDate);
    }
    finally {
        if (requestId === overviewRequestId) {
            hideComponentLoader("overviewDataContainer");
            setAnalysisControlsDisabled(false);
        }
    }
}

function renderOverview(data) {
    if (!data) {
        return;
    }

    document.getElementById("overviewContractValue").textContent = formatCurrency(data.contractValue);
    document.getElementById("overviewEarnedRevenue").textContent = formatCurrency(data.earnedRevenue);
    document.getElementById("overviewActualCost").textContent = formatCurrency(data.actualCost);

    document.getElementById("overviewGrossProfit").textContent = formatCurrency(data.grossProfit);
    document.getElementById("overviewGrossProfitMargin").textContent =
        data.grossProfitMarginPercentage == null
            ? "-"
            : formatPercentage(data.grossProfitMarginPercentage);

    document.getElementById("overviewNetProfit").textContent = formatCurrency(data.netProfit);
    document.getElementById("overviewNetProfitMargin").textContent =
        data.netProfitMarginPercentage == null
            ? "-"
            : formatPercentage(data.netProfitMarginPercentage);


    updateProfitState(data.grossProfit, "overviewGrossProfit");
    updateProfitMarginState(data.grossProfitMarginPercentage, "overviewGrossProfitMargin");

    updateProfitState(data.netProfit, "overviewNetProfit");
    updateProfitMarginState(data.netProfitMarginPercentage, "overviewNetProfitMargin");

    document.getElementById("overviewProgress").textContent = formatPercentage(data.overallProgressPercentage);
    document.getElementById("overviewProgressBar").style.width = `${Math.min(Math.max(data.overallProgressPercentage, 0), 100)}%`;
    document.getElementById("overviewCompletedItems").textContent = data.completedItems;
    document.getElementById("overviewInProgressItems").textContent = data.inProgressItems;
    document.getElementById("overviewNotStartedItems").textContent = data.notStartedItems;

    document.getElementById("overviewBudget").textContent = formatCurrency(data.budget);
    document.getElementById("overviewPeriodPlannedCost").textContent = formatCurrency(data.periodPlannedCost);
    document.getElementById("overviewCostActualCost").textContent = formatCurrency(data.actualCost);
    document.getElementById("overviewCostVariance").textContent = formatCurrency(data.costVariance);
    document.getElementById("overviewCpi").textContent =
        data.cpi == null
            ? "-"
            : data.cpi.toFixed(2);

    updateProfitState(data.costVariance, "overviewCostVariance");
    updateCpiState(data.cpi);

    document.getElementById("overviewDirectCost").textContent = formatCurrency(data.directCost);
    document.getElementById("overviewIndirectCost").textContent = formatCurrency(data.indirectCost);
    document.getElementById("overviewOverhead").textContent = formatCurrency(data.overhead);

    renderCostStructure(data);
    renderOverviewAlerts(data.alerts);
}

function updateProfitState(value, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.classList.remove("text-success", "text-danger", "text-body");

    if (value > 0) { element.classList.add("text-success"); }
    else if (value < 0) { element.classList.add("text-danger"); }
    else { element.classList.add("text-body"); }
}

function updateProfitMarginState(value, elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.classList.remove("text-success", "text-danger", "text-body");

    if (value == null) {
        element.classList.add("text-body");
        return;
    }

    if (value > 0) { element.classList.add("text-success"); }
    else if (value < 0) { element.classList.add("text-danger"); }
    else { element.classList.add("text-body"); }
}

function updateCpiState(value) {
    const element = document.getElementById("overviewCpi");
    if (!element) {
        return;
    }

    element.classList.remove("text-success", "text-danger", "text-body");

    if (value == null) {
        element.classList.add("text-body");
        return;
    }

    if (value >= 1) { element.classList.add("text-success"); }
    else { element.classList.add("text-danger"); }
}

function renderCostStructure(data) {
    const total = data.directCost + data.indirectCost + data.overhead;

    const directPercentage = total === 0 ? 0 : (data.directCost / total) * 100;
    const indirectPercentage = total === 0 ? 0 : (data.indirectCost / total) * 100;
    const overheadPercentage = total === 0 ? 0 : (data.overhead / total) * 100;

    document.getElementById("overviewDirectCostBar").style.width = `${directPercentage}%`;
    document.getElementById("overviewIndirectCostBar").style.width = `${indirectPercentage}%`;
    document.getElementById("overviewOverheadBar").style.width = `${overheadPercentage}%`;
}

function renderOverviewAlerts(alerts) {
    const container = document.getElementById("overviewAlerts");
    if (!container) {
        return;
    }

    container.innerHTML = "";
    const alertDefinitions = [
        {
            count: alerts?.costOverruns ?? 0,
            icon: "cil-warning",
            englishMessage: "Cost overruns detected: {count}",
            translationKey: "costAnalysis.overview.alerts.costOverruns"
        },
        {
            count: alerts?.progressWithoutCost ?? 0,
            icon: "cil-chart-line",
            englishMessage: "Progress recorded without cost: {count}",
            translationKey: "costAnalysis.overview.alerts.progressWithoutCost"
        },
        {
            count: alerts?.missingEstimatedCost ?? 0,
            icon: "cil-calculator",
            englishMessage: "Items missing estimated cost: {count}",
            translationKey: "costAnalysis.overview.alerts.missingEstimatedCost"
        },
        {
            count: alerts?.lossRisk ?? 0,
            icon: "cil-warning",
            englishMessage: "Items at loss risk: {count}",
            translationKey: "costAnalysis.overview.alerts.lossRisk"
        }
    ];

    const activeAlerts = alertDefinitions.filter(alert => alert.count > 0);
    if (activeAlerts.length === 0) {
        container.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-success">
                <i class="cil-check-circle fs-5"></i>
                <span data-i18n="costAnalysis.overview.alerts.noAlerts">
                    No cost control alerts detected.
                </span>
            </div>
        `;
        return;
    }

    activeAlerts.forEach(alert => {
        const translatedMessage = getTranslation(alert.translationKey);
        const message =
            (translatedMessage ?? alert.englishMessage)
                .replace("{count}", alert.count);

        const row = document.createElement("div");
        row.className = "d-flex align-items-center gap-2 py-2 border-bottom";
        row.innerHTML = `
            <i class="${alert.icon} text-warning"></i>
            <span>${message}</span>
        `;

        container.appendChild(row);
    });
}

async function loadItemAnalysis() {
    showComponentLoader("itemAnalysisDataContainer");
    const requestId = ++itemAnalysisRequestId;
    setAnalysisControlsDisabled(true);
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
        updateCostAnalysisPeriodRange(response.startDate, response.endDate);
    }
    finally {
        if (requestId === itemAnalysisRequestId) {
            hideComponentLoader("itemAnalysisDataContainer");
            setAnalysisControlsDisabled(false);
        }
    }
}

function updateCostAnalysisPeriodRange(startDate, endDate) {
    const periodRange = document.getElementById("costAnalysisPeriodRange");

    if (!periodRange) {
        return;
    }
    periodRange.textContent =
        `${formatDate(startDate)} — ${formatDate(endDate)}`;
}


function bindEvents() {
    document.getElementById("itemAnalysisFilters")
        .addEventListener("click", handleFilterClick);

    document.getElementById("costAnalysisPeriods")
        .addEventListener("click", handlePeriodClick);

    document.getElementById("itemAnalysisTableBody")
        .addEventListener("click", handleItemAnalysisTableClick);

    document.getElementById("applyCustomPeriod")
        .addEventListener("click", handleApplyCustomPeriod);

    document.getElementById("costAnalysisTabs")
        .addEventListener("shown.coreui.tab", handleCostAnalysisTabShown);
}

async function handleCostAnalysisTabShown(event) {
    hideAlert("customDateAlert");
    hideAlert("itemAnalysisAlert");

    await loadActiveTab();
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
    toggleCostAnalysisPeriodRange(true);

    document.querySelectorAll("#costAnalysisPeriods button")
        .forEach(btn => btn.classList.remove("active"));

    document.querySelector('#costAnalysisPeriods button[data-period="Cumulative"]')
        ?.classList.add("active");

    document.querySelectorAll("#itemAnalysisFilters button")
        .forEach(btn => btn.classList.remove("active"));

    document.querySelector('#itemAnalysisFilters button#filterAll')
        ?.classList.add("active");

    const periodRange = document.getElementById("costAnalysisPeriodRange");

    if (periodRange) {
        periodRange.textContent = "";
    }

    try {
        await loadActiveTab();
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
        toggleCostAnalysisPeriodRange(!isCustomDateRangeVisible);

        document.querySelectorAll("#costAnalysisPeriods button")
            .forEach(btn => btn.classList.remove("active"));

        if (isCustomDateRangeVisible) {
            button.classList.add("active");
        }
        return;
    }
    hideAlert("customDateAlert");
    hideAlert("itemAnalysisAlert");

    currentPeriod = period;
    updatePeriodColumnsVisibility();
    isCustomDateRangeVisible = false;
    toggleCustomDateRange(false);
    toggleCostAnalysisPeriodRange(true);

    document.querySelectorAll("#costAnalysisPeriods button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    try {
        await loadActiveTab();
    }
    catch (error) {
        showError(error.message);
    }
}

function toggleCostAnalysisPeriodRange(show) {
    const container = document.getElementById("costAnalysisPeriodRangeContainer");
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

        await loadActiveTab();

        toggleCostAnalysisPeriodRange(true);
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

function setAnalysisControlsDisabled(disabled) {
    document.querySelectorAll(
        "#costAnalysisPeriods button, #costAnalysisTabs .nav-link"
    ).forEach(button => {
        button.disabled = disabled;
    });

    const customPeriod = document.getElementById("applyCustomPeriod");

    if (customPeriod) {
        customPeriod.disabled = disabled;
    }
}
