import {
    get,
    post,
    put
} from "../../shared/api/api.client.js";

export async function getProjects() {

    return await get("/projects");

}

export async function getProjectById(id) {

    return await get(`/projects/${id}`);

}

export async function createProject(project) {

    return await post("/projects", project);

}

export async function updateProject(id, project) {

    return await put(`/projects/${id}`, project);

}
