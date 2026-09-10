document.addEventListener("DOMContentLoaded", () => {
  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const form = document.getElementById("contactForm");
  if (!form) return;

  const API_BASE_URL =
    window.ANYWORK_API_URL ||
    "https://anywork-opoe.onrender.com";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const originalText = button.textContent;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send request.");
      }

      button.textContent = "Request sent!";
      form.reset();
    } catch (error) {
      button.textContent = "Try again";
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 2000);
    }
  });
});
