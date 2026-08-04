import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";
import { initializeAppLoader, hideAppLoader } from "../../shared/layout/app-loader.js";
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject
} from "../../shared/services/projects.service.js";
import { showSuccess } from "../../shared/ui/toast.js";
import { getTranslation } from "../../shared/localization/i18n.js";
import { showAlert, hideAlert } from "../../shared/ui/alert.js";
import { initializeTooltips } from "../../shared/ui/tooltip.js";

let projectModal;

initializeProjects();

async function initializeProjects() {

    initializeAppLoader();

    try {
        requireAuthentication();

        await initializeLayout();

        initializeProjectModal();

        bindEvents();

        await loadProjects();

        initializeTooltips();
    }
    finally {
        hideAppLoader();
    }
}

function initializeProjectModal() {
    const modalElement = document.getElementById("projectModal");
    projectModal = new coreui.Modal(modalElement);
}

function bindEvents() {

    const addProjectButton = document.getElementById("addProjectButton");
    addProjectButton.addEventListener("click", openCreateProjectModal);

    const projectForm = document.getElementById("projectForm");
    projectForm.addEventListener("submit", handleProjectFormSubmit);
}

function openCreateProjectModal() {

    hideAlert("projectAlert");

    clearProjectForm();

    document.getElementById("projectModalTitle").textContent =
        getTranslation("projects.modal.addTitle") ?? "Add Project";

    document.getElementById("saveProjectButtonText").textContent =
        getTranslation("projects.modal.create") ?? "Create";

    document.getElementById("projectStartDate").disabled = false;

    projectModal.show();

}

function clearProjectForm() {
    document.getElementById("projectForm").reset();
    document.getElementById("projectId").value = "";
}

async function handleProjectFormSubmit(event) {
    event.preventDefault();

    const projectId = document.getElementById("projectId").value;
    const isEdit = Boolean(projectId);

    const project = {
        name: document.getElementById("projectName").value.trim(),
        description: document.getElementById("projectDescription").value.trim() || null,
        startDate: document.getElementById("projectStartDate").value,
        endDate: document.getElementById("projectEndDate").value || null
    };

    const saveProjectButton = document.getElementById("saveProjectButton");
    const saveProjectSpinner = document.getElementById("saveProjectSpinner");

    saveProjectButton.disabled = true;
    saveProjectSpinner.classList.remove("d-none");

    hideAlert("projectAlert");

    try {

        if (projectId) {
            await updateProject(Number(projectId), project);
        }
        else {
            await createProject(project);
        }

        projectModal.hide();
        clearProjectForm();
        document.getElementById("addProjectButton").focus();

        await loadProjects();

        showSuccess(
            isEdit
                ? getTranslation("projects.messages.updatedSuccessfully") ?? "Project updated successfully."
                : getTranslation("projects.messages.createdSuccessfully") ?? "Project created successfully."
        );

    }
    catch (error) {

        if (error.errors) {

            const validationMessage = Object.values(error.errors)[0][0];
            showAlert("projectAlert", validationMessage);
        }
        else {
            showAlert("projectAlert", error.message);
        }
    }
    finally {
        saveProjectButton.disabled = false;
        saveProjectSpinner.classList.add("d-none");
    }
}

async function loadProjects() {
    const projects = await getProjects();
    renderProjects(projects);
    bindProjectActions();
}

function renderProjects(projects) {
    const tableBody = document.getElementById("projectsTableBody");
    tableBody.replaceChildren();
    let index = 1;
    for (const project of projects) {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${index++}</td>
                <td><div class="fw-semibold">${project.name}</div></td>
                <td>${renderProjectStatusBadge(project.status)}</td>
                <td>${project.startDate ?? "-"}</td>
                <td>${project.endDate ?? "-"}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary edit-project-button"
                        data-project-id="${project.id}">
                        <i class="cil-pencil me-1"></i>
                        ${getTranslation("projects.table.edit") ?? "Edit"}
                    </button>
                </td>
        `;

        tableBody.appendChild(row);
    }
}

function bindProjectActions() {
    const editButtons = document.querySelectorAll(".edit-project-button");
    for (const button of editButtons) {
        button.addEventListener("click", handleEditProject);
    }
}

async function handleEditProject(event) {

    const projectId = Number(event.currentTarget.dataset.projectId);

    const project = await getProjectById(projectId);

    populateProjectForm(project);

    hideAlert("projectAlert");

    projectModal.show();

}

function populateProjectForm(project) {
    document.getElementById("projectId").value = project.id;
    document.getElementById("projectName").value = project.name;
    document.getElementById("projectDescription").value = project.description ?? "";
    document.getElementById("projectStartDate").value = project.startDate;
    document.getElementById("projectEndDate").value = project.endDate ?? "";
    document.getElementById("projectModalTitle").textContent = getTranslation("projects.modal.editTitle") ?? "Edit Project";
    document.getElementById("saveProjectButtonText").textContent = getTranslation("projects.modal.saveChanges") ?? "Save Changes";
    document.getElementById("projectStartDate").disabled = true;
}

function renderProjectStatusBadge(status) {

    switch (status) {

        case "BOQ Preparation":
            return `
                <span class="badge bg-warning text-dark">${getTranslation("projects.status.boqPreparation") ?? "BOQ Preparation"}</span>`;

        case "In Execution":
            return `
                <span class="badge bg-primary">${getTranslation("projects.status.inExecution") ?? "In Execution"}</span>`;

        case "Completed":
            return `
                <span class="badge bg-success">${getTranslation("projects.status.completed") ?? "Completed"}</span>`;

        case "Closed Out":
            return `
                <span class="badge bg-secondary">${getTranslation("projects.status.closedOut") ?? "Closed Out"}</span>`;

        default:
            return `
                <span class="badge bg-secondary">${status ?? "-"}</span>
            `;
    }
}
