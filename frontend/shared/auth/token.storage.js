const AUTH_SESSION_KEY = "auth_session";

export function saveSession(session) {

    const storage = session.rememberMe
        ? localStorage
        : sessionStorage;

    const otherStorage = session.rememberMe
        ? sessionStorage
        : localStorage;

    otherStorage.removeItem(AUTH_SESSION_KEY);

    storage.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify(session)
    );

}

export function getSession() {

    const session =
        localStorage.getItem(AUTH_SESSION_KEY)
        ?? sessionStorage.getItem(AUTH_SESSION_KEY);

    if (!session) {

        return null;

    }

    return JSON.parse(session);

}

export function getAccessToken() {

    const session = getSession();

    return session?.accessToken ?? null;

}

export function getRefreshToken() {

    const session = getSession();

    return session?.refreshToken ?? null;

}

export function hasSession() {

    return getSession() !== null;

}

export function clearSession() {

    localStorage.removeItem(AUTH_SESSION_KEY);

    sessionStorage.removeItem(AUTH_SESSION_KEY);

}