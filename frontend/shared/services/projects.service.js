import {
    get,
    post,
    put
} from "../api/api.client.js";

const PROJECTS_CACHE_KEY = "projects_cache";

export async function getProjects() {

    const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);

    if (cached) {
        return JSON.parse(cached);
    }

    const projects = await get("/projects");

    sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));

    return projects;
}

export async function getProjectById(id) {

    return await get(`/projects/${id}`);

}

export async function createProject(project) {

    const result = await post("/projects", project);

    clearProjectsCache();

    return result;
}

export async function updateProject(id, project) {

    const result = await put(`/projects/${id}`, project);

    clearProjectsCache();

    return result;
}

export function clearProjectsCache() {
    sessionStorage.removeItem(PROJECTS_CACHE_KEY);
}
