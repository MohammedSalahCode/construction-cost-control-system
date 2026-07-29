import { isAuthenticated } from "./auth.state.js";
import { appConfig } from "../config/app.config.js";

export function requireAuthentication() {

    if (isAuthenticated()) {
        return;
    }

    window.location.replace(appConfig.routes.login);
}

export function redirectIfAuthenticated() {

    if (!isAuthenticated()) {
        return;
    }

    window.location.replace(appConfig.routes.dashboard);
}
