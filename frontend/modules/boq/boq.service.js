import {
    get,
    post,
    put,
    del
} from "../../shared/api/api.client.js";


export async function getBOQItems(projectId) {

    return await get(`/projects/${projectId}/boq`);

}


export async function getBOQItemById(id) {

    return await get(`/boq/${id}`);

}


export async function createBOQItem(projectId, item) {

    return await post(`/projects/${projectId}/boq`, item);

}


export async function updateBOQItem(id, item) {

    return await put(`/boq/${id}`, item);

}


export async function deleteBOQItem(id) {

    return await del(`/boq/${id}`);

}


export async function lockBOQ(projectId) {

    return await put(`/projects/${projectId}/boq/lock`);

}