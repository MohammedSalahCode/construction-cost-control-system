import { appConfig } from "../config/app.config.js";
import { getAccessToken } from "../auth/token.storage.js";

export async function post(endpoint, data) {

    const response = await fetch(`${appConfig.apiBaseUrl}${endpoint}`, {
        
        method: "POST",

        headers: buildHeaders(),

        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw result;
    }

    return result;
}


export async function get(endpoint) {

    const response = await fetch(`${appConfig.apiBaseUrl}${endpoint}`, {

            method: "GET",

            headers: buildHeaders()

        }
    );

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

        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return headers;
}