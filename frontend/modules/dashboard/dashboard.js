import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";
import { PROJECT_CHANGED_EVENT } from "../../shared/project/project.events.js";
import { getProjects } from "../../shared/services/projects.service.js";
import {
    getCurrentProjectId,
    setCurrentProject
} from "../../shared/project/project.context.js";
import { getTranslation } from "../../shared/localization/i18n.js";
import { showError } from "../../shared/ui/toast.js";
import { formatDate } from "../../shared/utils/format.js";
import { initializeTooltips } from "../../shared/ui/tooltip.js";


initializeDashboard();

async function initializeDashboard() {

    requireAuthentication();

    await initializeLayout();

    await loadProjectCards();

    bindProjectEvents();

    updateDashboardState();

    initializeTooltips();
}


function bindProjectEvents() {
    window.addEventListener(PROJECT_CHANGED_EVENT, handleProjectChanged);
}

function handleProjectChanged() {
    updateDashboardState();
}

function updateDashboardState() {

    const welcome = document.getElementById("dashboardWelcome");
    const content = document.getElementById("dashboardContent");

    if (!welcome || !content) {
        return;
    }

    const hasProject = getCurrentProjectId();

    if (hasProject) {
        welcome.classList.add("d-none");
        content.classList.remove("d-none");
    }
    else {
        welcome.classList.remove("d-none");
        content.classList.add("d-none");
    }
}

async function loadProjectCards() {

    const container = document.getElementById("projectsContainer");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="col-12 text-center py-4">
            <span class="spinner-border" role="status"></span>
            <div class="mt-2">
                <span>
                    ${getTranslation("layout.sidebar.loadingProjects") ?? "Loading projects..."}
                </span>
            </div>
        </div>
    `;

    let projects;

    try {
        projects = await getProjects();
    }
    catch(error) {

        showError(error.message);
        container.innerHTML = "";
        return;
    }

    container.innerHTML = "";

    projects.forEach((project) => {

        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
            <div class="card h-100 shadow-sm project-card">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-4">

                        <div class="project-icon-wrapper">
                            <i class="project-status-icon"></i>
                        </div>

                        <span class="project-status-badge"></span>
                        
                    </div>
                    <h5 class="project-name fw-semibold mb-2"></h5>
                    <p class="text-body-secondary small flex-grow-1 project-description">
                    </p>
                    <div class="border-top pt-3 mt-2">
                        <div class="d-flex justify-content-between align-items-center small text-body-secondary mb-3">
                            <span>
                                <i class="cil-calendar me-1"></i>
                                ${getTranslation("projects.card.startDate") ?? "Start"}:
                                <span class="project-start-date"></span>
                            </span>
                            <span>
                                <i class="cil-list me-1"></i>
                                ${getTranslation("projects.card.boqItems") ?? "BOQ Items"}:
                                <span class="project-items-count"></span>
                            </span>
                        </div>
                        <button class="btn btn-outline-primary btn-sm select-project-btn">
                            ${getTranslation("projects.card.select") ?? "Open Project"}               
                            <i class="cil-external-link ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const config = getProjectIconConfig(project.status);
        const iconWrapper = card.querySelector(".project-icon-wrapper");
        const iconElement = card.querySelector(".project-status-icon");

        iconElement.className = `project-status-icon ${config.icon}`;
        iconWrapper.style.background = config.bg;
        iconElement.style.color = config.color;


        const projectName = card.querySelector(".project-name");
        projectName.textContent = project.name;

        const projectDescription = card.querySelector(".project-description");
        projectDescription.textContent =
            project.description ??
            (getTranslation("common.noDescription") ?? "No description");

        const projectStartDate = card.querySelector(".project-start-date");
        projectStartDate.textContent = formatDate(project.startDate);

        const projectItemsCount = card.querySelector(".project-items-count");
        projectItemsCount.textContent = project.boqItemsCount;

        const statusBadge = card.querySelector(".project-status-badge");
        statusBadge.outerHTML = renderProjectStatusBadge(project.status);
        
        const button = card.querySelector(".select-project-btn");

        button.addEventListener("click", () => {

            const selectedProject = {
                id: project.id,
                name: project.name
            };

            setCurrentProject(selectedProject);

            window.dispatchEvent(
                new CustomEvent(
                    PROJECT_CHANGED_EVENT,
                    {
                        detail: selectedProject
                    }
                )
            );
        });

        container.appendChild(card);
    });
}

function getProjectIconConfig(status) {
    switch (status) {
        case "BOQ Preparation":
            return { icon: "cil-description", color: "#f9b115", bg: "rgba(249, 177, 21, 0.1)" };
        case "In Execution":
            return { icon: "cil-media-play", color: "rgb(37 99 168)", bg: "rgba(13, 110, 253, 0.10)" };
        case "Completed":
            return { icon: "cil-check-circle", color: "#2eb85c", bg: "rgba(46, 184, 92, 0.1)" };
        case "Closed Out":
            return { icon: "cil-folder", color: "#adb5bd", bg: "rgba(173, 181, 189, 0.1)" };
        default:
            return { icon: "cil-map", color: "#2563a8", bg: "rgba(37, 99, 168, 0.1)" };
    }
}

function renderProjectStatusBadge(status) {

    switch (status) {

        case "BOQ Preparation":
            return `<span class="badge project-status-badge bg-warning text-dark">${getTranslation("projects.status.boqPreparation") ?? "BOQ Preparation"}</span>`;

        case "In Execution":
            return `<span class="badge project-status-badge bg-primary">${getTranslation("projects.status.inExecution") ?? "In Execution"}</span>`;

        case "Completed":
            return `<span class="badge project-status-badge bg-success">${getTranslation("projects.status.completed") ?? "Completed"}</span>`;

        case "Closed Out":
            return `<span class="badge project-status-badge bg-secondary">${getTranslation("projects.status.closedOut") ?? "Closed Out"}</span>`;

        default:
            return `<span class="badge bg-secondary">${status}</span>`;

    }
}
