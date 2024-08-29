document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const loader = document.getElementById("loader");
  const messageBoxContainer = document.getElementById("messageBox-container");
  const messageBox = document.getElementById("messageBox");

  loader.style.display = "flex";
  messageBoxContainer.style.display = "none";

  fetch("/videos/upload", {
    method: "POST",
    body: formData,
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
      document.getElementById("uploadForm").reset();

      messageBoxContainer.style.display = "block";

      if (typeof data === "string") {
        messageBox.textContent = "Server message: " + data;
      } else {
        messageBox.textContent = "Video uploaded successfully!";
      }
      messageBox.classList.add("alert-success");
      setTimeout(() => {
        messageBoxContainer.style.display = "none";
      }, 5000);
    })
    .catch((error) => {
      loader.style.display = "none";
      messageBox.style.display = "block";
      messageBox.classList.add("alert-error");

      error
        .text()
        .then((errorMessage) => {
          messageBox.textContent = "Error: " + errorMessage;
        })
        .catch(() => {
          messageBox.textContent = "An error occurred during the upload.";
        });
      setTimeout(() => {
        messageBoxContainer.style.display = "none";
      }, 5000);
    });
});
