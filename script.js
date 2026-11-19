document.addEventListener("DOMContentLoaded", () => {
  const getApiBaseUrl = () => {
    if (window.ANYWORK_API_URL) return window.ANYWORK_API_URL;

    if (window.location.protocol === "file:") {
      return "";
    }

    const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocalHost) {
      return window.location.origin;
    }

    return "";
  };

  const fallbackServices = [
    {
      slug: "home-cleaning",
      name: "Home Cleaning",
      description: "Routine cleaning and deep-cleaning for kitchens, bedrooms, and living spaces.",
      country: "usa",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
      icon: "🧹"
    },
    {
      slug: "moving-help",
      name: "Moving Help",
      description: "Loading, carrying, and room setup support for homes, apartments, and offices.",
      country: "usa",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
      icon: "📦"
    },
    {
      slug: "furniture-setup",
      name: "Furniture Setup",
      description: "Bed, table, and shelf assembly with careful placement and room-ready setup.",
      country: "usa",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      icon: "🪑"
    },
    {
      slug: "electrical-work",
      name: "Electrical Work",
      description: "Lighting, outlet, and electrical repair support for homes and rentals.",
      country: "usa",
      image: "https://images.pexels.com/photos/5691589/pexels-photo-5691589.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "⚡"
    },
    {
      slug: "plumbing",
      name: "Plumbing",
      description: "Leak fixes, fixture installation, and quick repair support from expert plumbers.",
      country: "usa",
      image: "https://images.pexels.com/photos/32588548/pexels-photo-32588548.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "🔧"
    },
    {
      slug: "driver-help",
      name: "Driver Help",
      description: "Reliable local driving support for errands, travel, and family transportation needs.",
      country: "usa",
      image: "https://images.pexels.com/photos/29333059/pexels-photo-29333059.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "🚖"
    },
    {
      slug: "old-age-care",
      name: "Old Age Care",
      description: "Compassionate everyday care, companionship, and routine support at home.",
      country: "usa",
      image: "https://images.pexels.com/photos/7551661/pexels-photo-7551661.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "🧓"
    },
    {
      slug: "nursing",
      name: "Nursing",
      description: "At-home nursing support for daily care and medical needs.",
      country: "india",
      image: "https://images.pexels.com/photos/5430213/pexels-photo-5430213.jpeg?auto=compress&cs=tinysrgb&w=900",
      icon: "🩹"
    }
  ];

  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const navToggle = document.getElementById("navToggle");
  const navWrap = navToggle?.closest(".nav-wrap");
  if (navToggle && navWrap) {
    const closeNav = () => {
      navWrap.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navWrap.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navWrap.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (!navWrap.contains(event.target)) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
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
  const offerPrices = document.querySelectorAll(".offer-price");
  const offerCopyUsd = document.querySelectorAll(".offer-copy-usd");
  const offerCopyInr = document.querySelectorAll(".offer-copy-inr");
  const storedCurrency = safeStorage.get("anywork_currency", "USD");

  const applyPublicPhone = (currency) => {
    const isIndia = String(currency).toUpperCase() === "INR";
    const display = isIndia ? "+91 8076235091" : "2192763746";
    const href = isIndia ? "tel:+918076235091" : "tel:2192763746";

    document.querySelectorAll("[data-country-phone]").forEach((phoneLink) => {
      phoneLink.textContent = display;
      phoneLink.setAttribute("href", href);
      phoneLink.setAttribute("aria-label", `Call AnyWork365 at ${display}`);
    });
  };

  const applyCurrency = (currency) => {
    const isIndia = currency === "INR";

    const indiaPricingNote = document.getElementById("india-pricing-note");
    if (indiaPricingNote) indiaPricingNote.hidden = !isIndia;

    offerPrices.forEach((priceEl) => {
      const value = isIndia ? priceEl.dataset.inr : priceEl.dataset.usd;
      if (!value) return;
      const symbol = isIndia ? "₹" : "$";
      const locale = isIndia ? "en-IN" : "en-US";
      priceEl.textContent = `${symbol}${Number(value).toLocaleString(locale)}`;
    });

    offerCopyUsd.forEach((el) => { el.hidden = isIndia; });
    offerCopyInr.forEach((el) => { el.hidden = !isIndia; });

    priceAmounts.forEach((amountEl) => {
      const priceEl = amountEl.closest(".price");
      const unitEl = priceEl ? priceEl.querySelector(".price-unit") : null;
      const noteEl = priceEl ? priceEl.querySelector(".price-quote-note") : null;

      if (isIndia) {
        amountEl.hidden = true;
        if (unitEl) unitEl.hidden = true;
        if (noteEl) noteEl.hidden = false;
        return;
      }

      amountEl.hidden = false;
      if (unitEl) unitEl.hidden = false;
      if (noteEl) noteEl.hidden = true;

      const value = amountEl.dataset.usd;
      if (!value) return;
      amountEl.textContent = `$${Number(value).toLocaleString("en-US")}`;
    });

    safeStorage.set("anywork_currency", currency);
  };

  const applyCountryServices = (currency) => {
    const active = (currency || document.body.dataset.currency || "USD").toUpperCase();
    document.body.dataset.currency = active;
    const isIndia = active === "INR";

    const cards = document.querySelectorAll("#service-grid .service-card-link[data-country]");
    if (!cards.length) return;

    cards.forEach((card) => {
      const countryTags = (card.dataset.country || "")
        .toLowerCase()
        .split(",")
        .map((tag) => tag.trim());

      const forIndia = countryTags.some((tag) => ["in", "india", "inr"].includes(tag));
      const forUS = countryTags.some((tag) => ["us", "usa", "usd"].includes(tag));
      const forAll = countryTags.some((tag) => ["all", "both", "global", ""].includes(tag));

      const show = forAll || (isIndia ? forIndia : forUS);
      card.dataset.countryVisible = String(show);
      card.classList.toggle("service-card-hidden", !show);
    });
  };
  const isCountryVisible = (countryValue, currency) => {
    const active = (currency || "USD").toUpperCase();
    const countryTags = (countryValue || "")
      .toLowerCase()
      .split(",")
      .map((tag) => tag.trim());

    const forIndia = countryTags.some((tag) => ["in", "india", "inr"].includes(tag));
    const forUS = countryTags.some((tag) => ["us", "usa", "usd"].includes(tag));
    const forAll = countryTags.some((tag) => ["all", "both", "global", ""].includes(tag));

    return forAll || (active === "INR" ? forIndia : forUS);
  };

  const applyCountryFormOptions = (currency) => {
    const formServiceSelect = document.querySelector('select[name="service"]');
    if (!formServiceSelect) return;

    const options = formServiceSelect.querySelectorAll("option[data-country]");
    if (!options.length) return;

    const active = (currency || "USD").toUpperCase();
    const isIndia = active === "INR";

    options.forEach((option) => {
      const shouldShow = isIndia && isCountryVisible(option.dataset.country, active);
      option.hidden = !shouldShow;
      option.disabled = !shouldShow;
    });

    const selectedHiddenOption = Array.from(options).some((option) => option.selected && option.hidden);
    if (selectedHiddenOption) {
      formServiceSelect.value = "";
    }
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

    const apiBaseUrl = getApiBaseUrl();
    const endpoints = [
      apiBaseUrl ? `${apiBaseUrl}/api/services` : "",
      "/data/services.json",
      "/services.json",
      "https://anywork-opoe.onrender.com/api/services"
    ].filter(Boolean);

    let loadedServices = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load ${endpoint}`);
        const data = await response.json();
        const services = Array.isArray(data.services)
          ? data.services
          : Array.isArray(data)
            ? data
            : [];

        if (services.length) {
          loadedServices = services;
          break;
        }
      } catch (error) {
        // Try the next source if the API is unavailable or rate limited.
      }
    }

    if (!loadedServices.length) {
      loadedServices = fallbackServices;
    }

    serviceGridEl.innerHTML = loadedServices.map(renderServiceCard).join("");
    applyCountryServices(safeStorage.get("anywork_currency", "USD"));
  };

  const servicesCatalogGrid = document.getElementById("services-catalog-grid");
  if (servicesCatalogGrid) {
    loadServices(servicesCatalogGrid);
  }

  const setupServiceSearch = (inputId, emptyId, gridEl) => {
    const input = document.getElementById(inputId);
    if (!input || !gridEl) return;
    const emptyState = document.getElementById(emptyId);

    const refreshServiceVisibility = () => {
      const query = input.value.trim().toLowerCase();
      const cards = gridEl.querySelectorAll(".service-card-link");
      let visibleCount = 0;

      cards.forEach((card) => {
        const matchesCountry = card.dataset.countryVisible !== "false";
        const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
        const visible = matchesCountry && matchesQuery;
        card.classList.toggle("service-card-hidden", !visible);
        if (visible) visibleCount += 1;
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0 || !cards.length;
      }
    };

    input.addEventListener("input", refreshServiceVisibility);
    refreshServiceVisibility();
  };

  setupServiceSearch("service-search-input", "service-search-empty", servicesCatalogGrid);

  const renderStars = (rating) => {
    const full = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, index) => (index < full ? "★" : "☆")).join("");
  };

  const renderShowcaseCard = (entry) => `
    <article class="showcase-card">
      <img src="${escapeHtml(entry.photo)}" alt="${escapeHtml(entry.name)}" class="showcase-photo" />
      <h3>${escapeHtml(entry.name)}</h3>
      <span class="showcase-role">${escapeHtml(entry.role)}</span>
      <span class="showcase-rating" aria-label="Rating: ${escapeHtml(entry.rating)} out of 5">${renderStars(entry.rating)}</span>
      <p>${escapeHtml(entry.blurb)}</p>
    </article>
  `;

  const loadShowcase = async () => {
    const showcaseSection = document.getElementById("meet-helpers");
    const showcaseGrid = document.getElementById("showcase-grid");
    if (!showcaseSection || !showcaseGrid) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/showcase`);
      if (!response.ok) throw new Error("Failed to load showcase");
      const data = await response.json();
      const showcase = Array.isArray(data.showcase) ? data.showcase : [];

      if (!showcase.length) {
        showcaseSection.style.display = "none";
        return;
      }

      showcaseGrid.innerHTML = showcase.map(renderShowcaseCard).join("");
      showcaseSection.style.display = "";
    } catch (error) {
      showcaseSection.style.display = "none";
    }
  };

  loadShowcase();

  if (countrySelect) {
    countrySelect.value = storedCurrency;
    countrySelect.addEventListener("change", (event) => {
      applyCurrency(event.target.value);
      applyPublicPhone(event.target.value);
      applyCountryServices(event.target.value);
      applyCountryFormOptions(event.target.value);
    });
  }

  if (priceAmounts.length || offerPrices.length) {
    applyCurrency(storedCurrency);
  }

  applyCountryServices(storedCurrency);
  applyCountryFormOptions(storedCurrency);
  applyPublicPhone(storedCurrency);

  const citySelect = document.getElementById("city-select");
  const serviceGrid = document.getElementById("service-grid");
  const servicesTitle = document.getElementById("services-title");
  const servicesStatus = document.getElementById("services-status");

  if (serviceGrid) {
    loadServices(serviceGrid);
  }

  setupServiceSearch("home-service-search-input", "home-service-search-empty", serviceGrid);

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

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }

  let deferredPrompt = null;
  const installButton = document.getElementById("installAppButton");

  if (installButton) {
    const showInstallButton = () => {
      installButton.hidden = false;
    };

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      showInstallButton();
    });

    window.addEventListener("appinstalled", () => {
      installButton.hidden = true;
      deferredPrompt = null;
    });

    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) {
        return;
      }

      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        installButton.hidden = true;
      }

      deferredPrompt = null;
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
