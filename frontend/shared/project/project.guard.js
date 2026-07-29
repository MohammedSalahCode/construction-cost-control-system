import { getCurrentProjectId } from "./project.context.js";
import { appConfig } from "../config/app.config.js";

export function requireProject() {

    const projectId = getCurrentProjectId();

    if (projectId) {
        return;
    }

    window.location.href = appConfig.routes.dashboard;
}