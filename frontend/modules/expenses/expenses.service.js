import {
    get,
    post,
    put
} from "../../shared/api/api.client.js";

export async function getBOQExpenseSummary(projectId) {
    return await get(`/projects/${projectId}/expenses/summary`);
}

export async function getExpenses(projectId) {
    return await get(`/projects/${projectId}/expenses`);
}

export async function getExpenseById(id) {
    return await get(`/expenses/${id}`);
}

export async function createExpense(projectId, expense) {
    return await post(`/projects/${projectId}/expenses`, expense);
}

export async function updateExpense(id, expense) {
    return await put(`/expenses/${id}`, expense);
}

export async function approveExpense(id) {
    return await post(`/expenses/${id}/approve`);
}

export async function rejectExpense(id, data) {
    return await post(`/expenses/${id}/reject`, data);
}