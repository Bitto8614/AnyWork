document.addEventListener("DOMContentLoaded", () => {
  const getApiBaseUrl = () => {
    if (window.ANYWORK_API_URL) return window.ANYWORK_API_URL;

    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocalHost) {
      return window.location.origin;
    }

    return "https://anywork-opoe.onrender.com";
  };

  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const carousel = document.querySelector(".moving-carousel");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const dots = [...carousel.querySelectorAll(".dot")];
    let currentSlide = 0;

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentSlide);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index));
    });

    setInterval(() => showSlide(currentSlide + 1), 3500);
  }

  const citySelect = document.getElementById("city-select");
  const serviceGrid = document.getElementById("service-grid");
  const servicesTitle = document.getElementById("services-title");
  const servicesStatus = document.getElementById("services-status");

  if (citySelect && serviceGrid && servicesTitle && servicesStatus) {
    const defaultText = "Select your country and city";

    const showServices = (city) => {
      serviceGrid.classList.remove("service-grid-hidden");
      servicesTitle.textContent = `Support in ${city}`;
      servicesStatus.textContent = `Available services for ${city}. Book the right help for your location.`;
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    citySelect.addEventListener("change", (event) => {
      const selectedCity = event.target.value;
      if (!selectedCity || selectedCity === defaultText) {
        serviceGrid.classList.add("service-grid-hidden");
        servicesTitle.textContent = "Support that makes moving easier.";
        servicesStatus.textContent = "Select a city to view available services.";
        return;
      }

      showServices(selectedCity);
    });
  }

  const form = document.getElementById("contactForm");
  if (form) {
    const API_BASE_URL = getApiBaseUrl();

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
  }

  const careerForm = document.getElementById("careerForm");
  if (careerForm) {
    const API_BASE_URL = getApiBaseUrl();

    careerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = careerForm.querySelector("button[type='submit']");
      const originalText = button.textContent;
      const formData = new FormData(careerForm);
      const payload = Object.fromEntries(formData.entries());

      button.disabled = true;
      button.textContent = "Registering...";

      try {
        const response = await fetch(`${API_BASE_URL}/api/career/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not register.");
        }

        button.textContent = "Registered!";
        careerForm.reset();
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
  }
});
