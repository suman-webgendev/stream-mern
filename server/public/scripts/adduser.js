document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("userForm");
  const loader = document.getElementById("loader");
  const messageBoxContainer = document.getElementById("messageBox-container");
  const messageBox = document.getElementById("messageBox");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    loader.style.display = "block";

    const formData = new FormData(form);
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then(async (response) => {
        loader.style.display = "none";

        if (response.ok) {
          try {
            return await response.json();
          } catch {
            return await response.text();
          }
        }
        return Promise.reject(response);
      })
      .then((data) => {
        form.reset();

        messageBoxContainer.style.display = "block";

        if (typeof data === "string") {
          messageBox.textContent = "Server message: " + data;
        } else {
          messageBox.textContent = "User created successfully!";
        }
        messageBox.classList.add("alert-success");
        setTimeout(() => {
          messageBoxContainer.style.display = "none";
        }, 5000);
      })
      .catch((error) => {
        loader.style.display = "none";
        messageBoxContainer.style.display = "block";
        messageBox.classList.add("alert-danger");

        error
          .text()
          .then((errorMessage) => {
            messageBox.textContent = "Error: " + errorMessage;
          })
          .catch(() => {
            messageBox.textContent = "An error occurred during user creation.";
          });
        setTimeout(() => {
          messageBoxContainer.style.display = "none";
        }, 5000);
      });
  });
});
