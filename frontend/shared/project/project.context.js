const STORAGE_KEY = "currentProject";

let currentProject = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;

export function setCurrentProject(project) {

    currentProject = project;

    if (!project) {
        localStorage.removeItem(STORAGE_KEY);
    }
    else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    }
}

export function getCurrentProject() {

    return currentProject;

}

export function getCurrentProjectId() {

    return currentProject?.id || null;

}
