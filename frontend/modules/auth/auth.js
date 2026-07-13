import { login } from "./auth.service.js";
import { redirectIfAuthenticated } from "../../shared/auth/auth.guard.js";
import { appConfig } from "../../shared/config/app.config.js";
import { showError } from "../../shared/ui/toast.js";

initializeLoginPage();

function initializeLoginPage() {

    redirectIfAuthenticated();

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    initializePasswordToggle();

    loginForm.addEventListener("submit", onLoginSubmitted);
}



async function onLoginSubmitted(event) {

    event.preventDefault();

    const loginRequest = {
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        rememberMe: document.getElementById("rememberMe").checked
    };

    const loginButton = document.getElementById("btnLogin");
    const loginSpinner = document.getElementById("btnLoginSpinner");

    loginButton.disabled = true;
    loginSpinner.classList.remove("d-none");

    try {

        await login(loginRequest);
 
        window.location.href = appConfig.routes.dashboard;

    }
    catch (error) {

        showError("Invalid email or password.");

    }
    finally {

        loginButton.disabled = false;
        loginSpinner.classList.add("d-none");

    }

}

function initializePasswordToggle() {

    const passwordInput = document.getElementById("password");
    const toggleButton = document.getElementById("togglePasswordButton");
    const eyeOpenIcon = document.getElementById("passwordVisibleIcon");
    const eyeClosedIcon = document.getElementById("passwordHiddenIcon");

    if (!passwordInput || !toggleButton  || !eyeOpenIcon || !eyeClosedIcon) {
        return;
    }

    const passwordTooltip = coreui.Tooltip.getInstance(toggleButton);

    toggleButton.addEventListener("click", () => {

        const isPasswordHidden = passwordInput.type === "password";

        passwordInput.type = isPasswordHidden ? "text" : "password";

        eyeOpenIcon.classList.toggle("d-none", isPasswordHidden);
        eyeClosedIcon.classList.toggle("d-none", !isPasswordHidden);
                    
        passwordTooltip?.setContent({
            ".tooltip-inner": isPasswordHidden
                ? "Hide password"
                : "Show password"
        });

        toggleButton.setAttribute(
            "aria-label",
            isPasswordHidden
                ? "Hide password"
                : "Show password"
        );

    });

}
