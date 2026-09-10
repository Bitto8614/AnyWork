document.addEventListener("DOMContentLoaded", () => {
  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = (formData.get("name") || "").toString().trim();
      const email = (formData.get("email") || "").toString().trim();
      const service = (formData.get("service") || "").toString().trim();
      const details = (formData.get("details") || "").toString().trim();

      const subject = encodeURIComponent(`AnyWork booking request: ${service || "New request"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nService: ${service}\n\nDetails:\n${details}`
      );

      const mailtoLink = `mailto:ajeet.usa013@gmail.com?subject=${subject}&body=${body}`;
      const button = form.querySelector("button[type='submit']");
      const originalText = button.textContent;

      button.textContent = "Opening email app...";
      button.disabled = true;

      window.location.href = mailtoLink;

      setTimeout(() => {
        form.reset();
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
    });
  }
});
