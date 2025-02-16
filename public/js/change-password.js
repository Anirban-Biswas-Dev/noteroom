// Function to toggle password visibility
function togglePasswordVisibility(button, passwordInput) {
  const isPasswordHidden = passwordInput.getAttribute("type") === "password";
  passwordInput.setAttribute("type", isPasswordHidden ? "text" : "password");

  const visibleIcon = button.querySelector(".visible-password-icon");
  const hiddenIcon = button.querySelector(".hidden-password-icon");

  if (visibleIcon && hiddenIcon) {
    visibleIcon.style.display = isPasswordHidden ? "block" : "none";
    hiddenIcon.style.display = isPasswordHidden ? "none" : "block";
  }
}

// Function to initialize password visibility toggles
function initializePasswordToggles() {
  const passwordContainers = document.querySelectorAll(".password-input-container");

  passwordContainers.forEach((container) => {
    const passwordInput = container.querySelector(".input-container--input-password");
    const toggleButton = container.querySelector(".toggle-password");

    if (passwordInput && toggleButton) {
      toggleButton.addEventListener("click", () => 
        togglePasswordVisibility(toggleButton, passwordInput)
      );
    }
  });
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializePasswordToggles);

async function changePassword() {
  function actionAfter(message) {
    document.querySelector("#message").style.display = "inline";
    document.querySelector("#message").innerHTML = message;

    document.querySelector("#current-password").value = "";
    document.querySelector("#new-password").value = "";
    document.querySelector("#retyped-password").value = "";
  }

  let current_password = document.querySelector("#current-password").value;
  let new_password = document.querySelector("#new-password").value;
  let re_password = document.querySelector("#retyped-password").value;

  if (current_password && new_password && new_password === re_password) {
    let response = await fetch("/auth/password-change?action=change", {
      method: "post",
      body: (function () {
        let passwordData = new FormData();
        passwordData.append("current_password", current_password);
        passwordData.append("new_password", new_password);
        return passwordData;
      })(),
    });
    let data = await response.json();
    data.changed
      ? actionAfter("Password changed successfully")
      : data.changed === null
      ? actionAfter("Your current password isn't valid!!")
      : actionAfter(
          "Couldn't change the password! Please try again a bit later."
        );
  }
}
