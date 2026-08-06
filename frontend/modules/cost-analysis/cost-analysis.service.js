import { get, post } from "../../shared/api/api.client.js";

export async function getItemAnalysis(
    projectId,
    period = "Cumulative",
    startDate = null,
    endDate = null
) {
    const params = new URLSearchParams();

    params.append("period", period);

    if (period === "Custom") {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
    }

    const queryString = params.toString();

    return await get(
        `/projects/${projectId}/cost-analysis/items?${queryString}`
    );
}

export async function getOverview(
    projectId,
    period = "Cumulative",
    startDate = null,
    endDate = null
) {
    const params = new URLSearchParams();

    params.append("period", period);

    if (period === "Custom") {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
    }

    const queryString = params.toString();

    return await get(
        `/projects/${projectId}/cost-analysis/overview?${queryString}`
    );
}

export async function createEstimatedCost(boqItemId, estimatedUnitCost) {
    return await post(`/boq/${boqItemId}/estimated-cost`, {estimatedUnitCost});
}
