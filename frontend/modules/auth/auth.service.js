import {
    get,
    post
} from "../../shared/api/api.client.js";

import {
    saveSession,
    getRefreshToken,
    clearSession
} from "../../shared/auth/token.storage.js";


export async function login(loginRequest) {

    const response = await post("/auth/login", loginRequest);

    const session = {

        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
        rememberMe: loginRequest.rememberMe

    };

    saveSession(session);

    return response;

}


export async function logout() {

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        
        clearSession();
        return;
    }

    try {

        await post("/auth/logout", { refreshToken });

    }
    finally {

        clearSession();

    }

}

export async function getCurrentUser() {

    return await get("/auth/me");

}