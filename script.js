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

  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const dots = [...carousel.querySelectorAll(".dot")];
    if (!track || slides.length < 2) return;
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

    setInterval(() => showSlide(currentSlide + 1), 4000 + Math.round(Math.random() * 800));
  });

  const safeStorage = {
    get(key, fallback) {
      try {
        return localStorage.getItem(key) || fallback;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // Ignore - storage may be unavailable (file:// pages, private browsing, etc.)
      }
    }
  };

  const countrySelect = document.getElementById("country-currency-select");
  const priceAmounts = document.querySelectorAll(".price-amount");
  const storedCurrency = safeStorage.get("anywork_currency", "USD");

  const applyCurrency = (currency) => {
    priceAmounts.forEach((amountEl) => {
      const value = currency === "INR" ? amountEl.dataset.inr : amountEl.dataset.usd;
      if (!value) return;
      const symbol = currency === "INR" ? "₹" : "$";
      const locale = currency === "INR" ? "en-IN" : "en-US";
      amountEl.textContent = `${symbol}${Number(value).toLocaleString(locale)}`;
    });

    safeStorage.set("anywork_currency", currency);
  };

  const applyCountryServices = (currency) => {
    const cards = document.querySelectorAll("#service-grid .service-card-link[data-country]");
    if (!cards.length) return;
    const country = currency === "INR" ? "india" : "usa";
    cards.forEach((card) => {
      card.classList.toggle("service-card-hidden", card.dataset.country !== country);
    });
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));

  const renderServiceCard = (service) => {
    const media = service.image
      ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.name)}" />`
      : `<div class="service-icon-block" aria-hidden="true">${escapeHtml(service.icon || "🔧")}</div>`;

    return `
      <a href="/services/${escapeHtml(service.slug)}" class="service-card-link" data-country="${escapeHtml(service.country)}">
        <article class="service-card">
          ${media}
          <div class="service-card-content">
            <h3>${escapeHtml(service.name)}</h3>
            <p>${escapeHtml(service.description)}</p>
            <span class="service-card-footer">Learn more</span>
          </div>
        </article>
      </a>
    `;
  };

  const loadServices = async (serviceGridEl) => {
    if (!serviceGridEl) return;
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/services`);
      if (!response.ok) throw new Error("Failed to load services");
      const data = await response.json();
      const services = Array.isArray(data.services) ? data.services : [];
      serviceGridEl.innerHTML = services.map(renderServiceCard).join("");
    } catch (error) {
      serviceGridEl.innerHTML = `<p class="services-loading">Could not load services right now. Please refresh the page.</p>`;
    } finally {
      applyCountryServices(safeStorage.get("anywork_currency", "USD"));
    }
  };

  const servicesCatalogGrid = document.getElementById("services-catalog-grid");
  if (servicesCatalogGrid) {
    loadServices(servicesCatalogGrid);
  }

  if (countrySelect) {
    countrySelect.value = storedCurrency;
    countrySelect.addEventListener("change", (event) => {
      applyCurrency(event.target.value);
      applyCountryServices(event.target.value);
    });
  }

  if (priceAmounts.length) {
    applyCurrency(storedCurrency);
  }

  applyCountryServices(storedCurrency);

  const citySelect = document.getElementById("city-select");
  const serviceGrid = document.getElementById("service-grid");
  const servicesTitle = document.getElementById("services-title");
  const servicesStatus = document.getElementById("services-status");

  if (serviceGrid) {
    loadServices(serviceGrid);
  }

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
        servicesTitle.textContent = "Everyday home & lifestyle services, all in one place.";
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

      button.disabled = true;
      button.textContent = "Registering...";

      try {
        const response = await fetch(`${API_BASE_URL}/api/career/register`, {
          method: "POST",
          body: formData,
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
