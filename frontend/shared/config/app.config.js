const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const appConfig = {
    apiBaseUrl: isDevelopment 
        ? "https://localhost:7102/api" 
        : "https://cost-control-api.runasp.net/api",

        routes: {

        login: "/modules/auth/login.html",

        dashboard: "/modules/dashboard/dashboard.html"

    },
        ui: {

        toastDuration: 3000

    }
    
};
