import { getCurrentUser, logout } from "../../modules/auth/auth.service.js";
import { appConfig } from "../config/app.config.js";
import { getLanguage, setLanguage } from "../localization/language.service.js";
import { initializeLocalization } from "../localization/i18n.js";
import {
    setCurrentProject,
    getCurrentProject,
    getCurrentProjectId
} from "../project/project.context.js";
import { getTranslation } from "../localization/i18n.js";
import { PROJECT_CHANGED_EVENT } from "../project/project.events.js";
import { getProjects } from "../services/projects.service.js";

export async function initializeLayout() {

    await initializeSidebar();

    initializeSidebarUI();

    initializeLocalization();

    initializeCurrentUser();

    initializeLogout();

    initializeLanguageSwitcher();

    await initializeProjectSelector();

}


async function initializeSidebar() {
    await loadSidebar();
}

function initializeSidebarUI() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar && !coreui.Sidebar.getInstance(sidebar)) {
        new coreui.Sidebar(sidebar);
    }

    const navigation = document.querySelector('[data-coreui="navigation"]');

    if (navigation && !coreui.Navigation.getInstance(navigation)) {
        new coreui.Navigation(navigation);
    }
}

function initializeCurrentUser() {
    loadCurrentUser();
}

function initializeLogout() {
    bindLogout();
}

function initializeLanguageSwitcher() {
    bindLanguageSwitcher();
    updateLanguageDropdown();
}


async function loadSidebar() {

    const response = await fetch("../../shared/layout/sidebar.html");

    if (!response.ok) {
        throw new Error("Failed to load sidebar.");
    }

    const sidebarHtml = await response.text();

    const sidebarContainer = document.getElementById("sidebarContainer");

    if (sidebarContainer) {
        sidebarContainer.outerHTML = sidebarHtml;
    }

}

function bindLogout() {
    const logoutButton = document.getElementById("logoutButton");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", onLogoutClicked);
}

async function onLogoutClicked(event) {

    event.preventDefault();

    try {
        await logout();
    }
    finally {
        clearProjectSelection();
        window.location.replace(appConfig.routes.login);
    }
}

async function loadCurrentUser() {

    try {
        const user = await getCurrentUser();
        const userName = document.getElementById("currentUserName");
        const userRole = document.getElementById("currentUserRole");
           
        if (userName) { 
            userName.textContent = user.fullName; 
        }

        if (userRole) { 
            userRole.textContent = user.role; 
        }
    }
    catch {

        // Leave the default user information.
    }

}

function bindLanguageSwitcher(){
    const englishButton = document.getElementById("languageEnglish");
    const arabicButton = document.getElementById("languageArabic");

    englishButton?.addEventListener("click", () => setLanguage("en"));
    arabicButton?.addEventListener("click", () => setLanguage("ar"));
}

function updateLanguageDropdown() {
    const englishButton = document.getElementById("languageEnglish");
    const arabicButton = document.getElementById("languageArabic");
    const currentLanguage = getLanguage();
    englishButton?.classList.toggle("active", currentLanguage === "en");
    arabicButton?.classList.toggle("active", currentLanguage === "ar");
}

async function initializeProjectSelector() {

    await loadProjects();

    bindProjectSelector();
    bindProjectEvents();

    updateProjectSelectorUI();
    updateCurrentProjectTitle();

}

function bindProjectEvents() {

    window.addEventListener(
        PROJECT_CHANGED_EVENT,
        () => {
            updateProjectSelectorUI();
            updateCurrentProjectTitle();
        }
    );
}

async function loadProjects() {

    const label = document.getElementById("projectSelectorLabel");

    if (label) {
        label.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            <span>
                ${getTranslation("layout.sidebar.loadingProjects") ?? "Loading projects..."}
            </span>
        `;
    }

    try {
        const projects = await getProjects();
        const menu = document.getElementById("projectSelectorMenu");

        if (!menu) {
            return;
        }
        menu.innerHTML = "";
        projects.forEach(project => {
            const item = document.createElement("li");
            item.innerHTML = `
                <button class="dropdown-item w-100 text-truncate"
                        type="button"
                        data-project-id="${project.id}"
                        data-project-name="${project.name}"
                        data-coreui-toggle="tooltip"
                        title="${project.name}">
                    ${project.name}
                </button>
            `;
            menu.appendChild(item);
        });
    }
    catch (error) {
        if (label) {
            label.textContent = error.message;
        }
    }
}

function bindProjectSelector() {

    const projectItems = document.querySelectorAll("#projectSelectorMenu .dropdown-item");

    projectItems.forEach(item => {
        item.addEventListener("click", () => {
            const projectId = item.dataset.projectId;
            const projectName = item.dataset.projectName;
            selectProject(projectId, projectName);
        });
    });
}

function selectProject(projectId, projectName) {

    const project = {
        id: Number(projectId),
        name: projectName
    };

    setCurrentProject(project);
    notifyProjectChanged(project);
    updateProjectSelectorUI();
}

function notifyProjectChanged(project) {

    window.dispatchEvent(
        new CustomEvent(PROJECT_CHANGED_EVENT, {
            detail: project
        })
    );

}

function updateProjectSelectorUI() {
    
    const label = document.getElementById("projectSelectorLabel");

    if (!label) {
        return;
    }

    const project = getCurrentProject();

    if (project) {
        label.textContent = project.name;
        label.title = project.name;        
    }
    else {
        label.textContent = getTranslation("layout.sidebar.selectProject") ?? "Select Project";
        label.removeAttribute("title");
    }
}

function updateCurrentProjectTitle() {

    const title = document.getElementById("currentProjectTitle");

    if (!title) {
        return;
    }

    const project = getCurrentProject();

    const currentProjectText = getTranslation("layout.sidebar.currentProject") ?? "Current Project";

    if (project) {
        title.textContent = `${currentProjectText}: ${project.name}`;
    }
    else {
        title.textContent = currentProjectText;
    }

}

function clearProjectSelection() {
    setCurrentProject(null);
}
