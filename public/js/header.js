document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu logic encapsulated in a class
  class MobileMenu {
    constructor(menuToggleSelector, menuSelector) {
      this.menuToggle = document.querySelector(menuToggleSelector);
      this.menu = document.querySelector(menuSelector);

      if (this.menuToggle && this.menu) {
        this.init();
      } else {
        console.error("Menu toggle or menu element not found.");
      }
    }

    init() {
      this.addEventListeners();
    }

    toggleMenu() {
      this.menu.classList.toggle("show-menu");
    }

    closeMenuOnOutsideClick(event) {
      if (
        !this.menu.contains(event.target) &&
        !this.menuToggle.contains(event.target)
      ) {
        this.menu.classList.remove("show-menu");
      }
    }

    addEventListeners() {
      this.menuToggle.addEventListener("click", () => this.toggleMenu());
      document.addEventListener("click", (event) =>
        this.closeMenuOnOutsideClick(event)
      );
    }
  }

  // Active Tab Highlight Logic
  class ActiveTab {
    constructor(navLinksSelector, activeClass = "active-tab") {
      this.navLinks = document.querySelectorAll(navLinksSelector);
      this.activeClass = activeClass;

      if (this.navLinks.length) {
        this.init();
      } else {
        console.error("No navigation links found.");
      }
    }

    init() {
      this.updateActiveTab();
      this.addEventListeners();
    }

    getCurrentPath() {
      return window.location.pathname;
    }

    updateActiveTab() {
      const currentPath = this.getCurrentPath();

      this.navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentPath) {
          link.classList.add(this.activeClass);
        } else {
          link.classList.remove(this.activeClass);
        }
      });
    }

    addEventListeners() {
      window.addEventListener("popstate", () => this.updateActiveTab());
    }
  }

  new MobileMenu("#menuToggle", ".mobile-menu");
  new ActiveTab("nav a, .mobile-menu a"); // Adjust selector for desktop and mobile menus
});
