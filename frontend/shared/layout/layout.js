import { getCurrentUser, logout } from "../../modules/auth/auth.service.js";
import { appConfig } from "../config/app.config.js";
import { getLanguage, setLanguage } from "../localization/language.service.js";
import { initializeLocalization } from "../localization/i18n.js";
import { setCurrentProjectId, getCurrentProjectId } from "../project/project.context.js";

export async function initializeLayout() {

    await initializeSidebar();

    initializeSidebarUI();

    initializeLocalization();

    initializeCurrentUser();

    initializeLogout();

    initializeLanguageSwitcher();
    
    initializeProjectSelector();

}


async function initializeSidebar() {

    await loadSidebar();

}


function initializeSidebarUI() {

    const sidebar = document.getElementById("sidebar");

    if (sidebar &&
        !coreui.Sidebar.getInstance(sidebar)) {

        new coreui.Sidebar(sidebar);

    }

    const navigation = document.querySelector('[data-coreui="navigation"]');

    if (navigation &&
        !coreui.Navigation.getInstance(navigation)) {

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

    const response =
        await fetch("../../shared/layout/sidebar.html");

    if (!response.ok) {

        throw new Error(
            "Failed to load sidebar."
        );

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

        window.location.href = appConfig.routes.login;

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

    const englishButton =
        document.getElementById("languageEnglish");


    const arabicButton =
        document.getElementById("languageArabic");


    englishButton?.addEventListener(
        "click",
        () => setLanguage("en")
    );


    arabicButton?.addEventListener(
        "click",
        () => setLanguage("ar")
    );

}

function updateLanguageDropdown() {

    const englishButton =
        document.getElementById("languageEnglish");

    const arabicButton =
        document.getElementById("languageArabic");

    const currentLanguage = getLanguage();

    englishButton?.classList.toggle(
        "active",
        currentLanguage === "en"
    );

    arabicButton?.classList.toggle(
        "active",
        currentLanguage === "ar"
    );

}



function initializeProjectSelector() {

    bindProjectSelector();

    updateProjectSelectorUI();

}

function bindProjectSelector() {

    const projectItems = document.querySelectorAll(
        "#projectSelectorContainer .dropdown-item"
    );

    projectItems.forEach(item => {

        item.addEventListener("click", () => {

            const projectId = item.dataset.projectId;
            const projectName = item.dataset.projectName;

            selectProject(projectId, projectName);

        });

    });

}

function selectProject(projectId, projectName) {

    setCurrentProjectId(projectId);

    localStorage.setItem("currentProjectName", projectName);

    updateProjectSelectorUI();

}

function updateProjectSelectorUI() {

    const container = document.getElementById("projectSelectorContainer");
    const label = document.getElementById("projectSelectorLabel");

    const projectId = getCurrentProjectId();
    const projectName = localStorage.getItem("currentProjectName");

    if (projectId) {

        container.classList.add("project-selected");
        label.textContent = projectName;

    }
    else {

        container.classList.remove("project-selected");


    }

}

function clearProjectSelection() {

    localStorage.removeItem("currentProjectId");

    localStorage.removeItem("currentProjectName");

    setCurrentProjectId(null);

}
