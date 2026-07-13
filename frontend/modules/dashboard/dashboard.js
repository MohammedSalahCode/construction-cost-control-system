import { requireAuthentication } from "../../shared/auth/auth.guard.js";
import { initializeLayout } from "../../shared/layout/layout.js";

initializeDashboard();

async function initializeDashboard() {

    requireAuthentication();

    await initializeLayout();

    //page components
    
    // Load page data
}
