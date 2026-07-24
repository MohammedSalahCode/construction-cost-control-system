import {
    get,
    post,
    put
} from "../../shared/api/api.client.js";

export async function getBOQProgressSummary(projectId) {

    return await get(`/projects/${projectId}/progress/summary`);

}

export async function getProgressEntries(projectId) {

    return await get(`/projects/${projectId}/progress`);

}

export async function getProgressById(id) {

    return await get(`/progress/${id}`);

}

export async function createProgress(boqItemId, progress) {

    return await post(`/boq-items/${boqItemId}/progress`, progress);

}

export async function updateProgress(id, progress) {

    return await put(`/progress/${id}`, progress);

}

export async function approveProgress(id) {

    return await post(`/progress/${id}/approve`);

}

export async function rejectProgress(id, data) {

    return await post(`/progress/${id}/reject`, data);

}
