document.addEventListener("DOMContentLoaded", init);

function init() {
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initCurrentYear();
  initBackToTop();
  initAccordion();
  initFilters();
  initModal();
  initContactForm();
  initDemoButton();
}

function initActiveNav() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    link.classList.toggle("is-active", linkPage === currentPage);
  });
}

function initMenuToggle() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");

  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });
}

function initThemeToggle() {
  const button = document.querySelector(".theme-toggle");

  if (!button) return;

  const savedTheme = localStorage.getItem("siteTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("theme-dark");
  }

  updateButtonText();

  button.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");

    const theme = document.body.classList.contains("theme-dark")
      ? "dark"
      : "light";

    localStorage.setItem("siteTheme", theme);
    updateButtonText();
  });

  function updateButtonText() {
    const isDark = document.body.classList.contains("theme-dark");
    button.textContent = isDark ? "Світла тема" : "Темна тема";
  }
}

function initCurrentYear() {
  const yearElements = document.querySelectorAll(".current-year");
  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });
}

function initBackToTop() {
  const button = document.querySelector(".back-to-top");

  if (!button) return;

  function toggleButton() {
    button.hidden = window.scrollY < 300;
  }

  window.addEventListener("scroll", toggleButton);
  toggleButton();

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initAccordion() {
  const buttons = document.querySelectorAll(".accordion-button");

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const shouldOpen = button.getAttribute("aria-expanded") !== "true";

      buttons.forEach((item) => {
        item.setAttribute("aria-expanded", "false");
        item.nextElementSibling.hidden = true;
      });

      if (shouldOpen) {
        button.setAttribute("aria-expanded", "true");
        button.nextElementSibling.hidden = false;
      }
    });
  });
}

function initFilters() {
  const searchInput = document.querySelector("#schedule-search");
  const rows = document.querySelectorAll("table tbody tr");

  if (!searchInput || !rows.length) return;

  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.trim().toLowerCase();

    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();
      row.hidden = !rowText.includes(searchText);
    });
  });
}

function initModal() {
  const modal = document.querySelector("#site-modal");
  const openButton = document.querySelector(".open-modal");

  if (!modal || !openButton) return;

  const closeButtons = modal.querySelectorAll("[data-modal-close]");

  function openModal() {
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  openButton.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");

  if (!form) return;

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const messageInput = form.querySelector("#message");
  const agreeInput = form.querySelector('[name="agree"]');

  const nameError = form.querySelector("#name-error");
  const emailError = form.querySelector("#email-error");
  const messageError = form.querySelector("#message-error");
  const agreeError = form.querySelector("#agree-error");

  const counter = form.querySelector("#message-counter");
  const successBlock = document.querySelector("#form-success");
  const fields = form.querySelectorAll(
    "input[name], select[name], textarea[name]"
  );

  const draftKey = "contactDraft";

  restoreDraft();
  updateCounter();

  form.addEventListener("input", () => {
    saveDraft();
    updateCounter();
    successBlock.hidden = true;
  });

  form.addEventListener("change", saveDraft);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isNameValid = nameInput.value.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailInput.value.trim()
    );
    const isMessageValid = messageInput.value.trim().length >= 10;
    const isAgreeValid = agreeInput.checked;

    showError(
      nameInput,
      nameError,
      isNameValid ? "" : "Введіть щонайменше 2 символи."
    );

    showError(
      emailInput,
      emailError,
      isEmailValid ? "" : "Введіть коректну email-адресу."
    );

    showError(
      messageInput,
      messageError,
      isMessageValid ? "" : "Повідомлення має містити щонайменше 10 символів."
    );

    agreeError.textContent = isAgreeValid
      ? ""
      : "Потрібно погодитися з правилами.";

    if (!isNameValid || !isEmailValid || !isMessageValid || !isAgreeValid) {
      successBlock.hidden = true;
      return;
    }

    const formData = new FormData(form);

    successBlock.textContent =
      `Дані успішно опрацьовано!\n` +
      `Ім’я: ${formData.get("name")}\n` +
      `Email: ${formData.get("email")}\n` +
      `Повідомлення: ${formData.get("message")}`;

    successBlock.hidden = false;
    localStorage.removeItem(draftKey);
    form.reset();
    updateCounter();
  });

  function showError(field, errorElement, message) {
    field.classList.toggle("is-invalid", Boolean(message));
    errorElement.textContent = message;
  }

  function updateCounter() {
    counter.textContent = `${messageInput.value.length} / 500`;
  }

  function saveDraft() {
    const draft = {};

    fields.forEach((field) => {
      if (field.type === "checkbox") {
        draft[field.name] = field.checked;
      } else if (field.type === "radio") {
        if (field.checked) {
          draft[field.name] = field.value;
        }
      } else {
        draft[field.name] = field.value;
      }
    });

    localStorage.setItem(draftKey, JSON.stringify(draft));
  }

  function restoreDraft() {
    const draft = JSON.parse(localStorage.getItem(draftKey) || "{}");

    fields.forEach((field) => {
      if (!(field.name in draft)) return;

      if (field.type === "checkbox") {
        field.checked = draft[field.name];
      } else if (field.type === "radio") {
        field.checked = field.value === draft[field.name];
      } else {
        field.value = draft[field.name];
      }
    });
  }
}

function initDemoButton() {
  const button = document.querySelector("#demo-button");

  if (!button) return;

  button.addEventListener("click", () => {
    const oldText = button.textContent;

    button.textContent = "ТИ НАТИСНУЛА МЕНЕ! 💜";

    setTimeout(() => {
      button.textContent = oldText;
    }, 1000);
  });
}