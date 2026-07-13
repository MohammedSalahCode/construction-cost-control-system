const STORAGE_KEY = "currentProjectId";

let currentProjectId = localStorage.getItem(STORAGE_KEY) || null;


export function setCurrentProjectId(id) {

    currentProjectId = id;

    if (id === null || id === undefined) {

        localStorage.removeItem(STORAGE_KEY);

    }
    else {

        localStorage.setItem(STORAGE_KEY, id);

    }
    
}


export function getCurrentProjectId() {

    return currentProjectId;

}