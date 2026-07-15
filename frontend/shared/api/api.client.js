import { appConfig } from "../config/app.config.js";
import { getAccessToken } from "../auth/token.storage.js";

export async function get(endpoint) {

    return await request("GET", endpoint);

}

export async function post(endpoint, data) {

    return await request("POST", endpoint, data);

}

export async function put(endpoint, data) {

    return await request("PUT", endpoint, data);

}

export async function del(endpoint) {

    return await request("DELETE", endpoint);

}

async function request(method, endpoint, data = null) {

    const options = {
        method,
        headers: buildHeaders()
    };

    if (data !== null) {

        options.body = JSON.stringify(data);

    }

    const response = await fetch(
        `${appConfig.apiBaseUrl}${endpoint}`,
        options
    );

    if (response.status === 204) {

        return null;

    }

    const result = await response.json();

    if (!response.ok) {

        throw result;

    }

    return result;

}


function buildHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    const token = getAccessToken();

    if (token) {

        headers.Authorization = `Bearer ${token}`;

    }

    return headers;

}
