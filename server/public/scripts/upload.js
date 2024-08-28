document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  const formData = new FormData(this); // Create a new FormData object from the form

  // Debugging: Log all FormData entries to ensure data is correctly populated
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  // Send the form data to the API endpoint
  fetch("/videos/upload", {
    // Replace with your actual API endpoint
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json().catch(() => response.text());
      }
      return Promise.reject(response); // Handle errors
    })
    .then((data) => {
      if (typeof data === "string") {
        console.log("Server message:", data);
      } else {
        console.log("Server response:", data); // Expected output on success
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      error.text().then((errorMessage) => {
        console.error("Error message:", errorMessage);
      });
    });
});
