/* ==========================================================================
   VBL — Site navigation behaviour (header state, menu overlay, search,
   newsletter form). Vanilla ES6, no dependencies.
   ========================================================================== */

(() => {
  "use strict";

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const searchToggle = document.querySelector("[data-search-trigger]");
  const siteSearch = document.querySelector("[data-site-search]");
  const searchInput = siteSearch ? siteSearch.querySelector("input[type='search']") : null;
  const newsletterTrigger = document.querySelector("[data-newsletter-trigger]");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterForms = document.querySelectorAll(".newsletter-form");
  const main = document.getElementById("main-content");

  const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

  if (!header || !menuToggle || !navOverlay) return;

  /* ---------------------------------------------------------------------
     Header scroll state — adds a subtle border/shadow once the page scrolls
     --------------------------------------------------------------------- */
  const updateHeaderScrollState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  };

  /* ---------------------------------------------------------------------
     Expandable search bar
     --------------------------------------------------------------------- */
  const closeSearch = () => {
    if (!siteSearch || !searchToggle) return;
    siteSearch.classList.remove("is-open");
    searchToggle.setAttribute("aria-expanded", "false");
  };

  const openSearch = () => {
    if (!siteSearch || !searchToggle) return;
    siteSearch.classList.add("is-open");
    searchToggle.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => searchInput && searchInput.focus());
  };

  const toggleSearch = () => {
    if (!siteSearch) return;
    siteSearch.classList.contains("is-open") ? closeSearch() : openSearch();
  };

  /* ---------------------------------------------------------------------
     Full-screen navigation overlay
     --------------------------------------------------------------------- */
  const openNav = () => {
    navOverlay.classList.add("is-open");
    navOverlay.setAttribute("aria-hidden", "false");
    menuToggle.classList.add("is-active");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("nav-open");
    if (main) main.setAttribute("inert", "");
    closeSearch();
  };

  const closeNav = () => {
    navOverlay.classList.remove("is-open");
    navOverlay.setAttribute("aria-hidden", "true");
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
    if (main) main.removeAttribute("inert");
  };

  const toggleNav = () => {
    navOverlay.classList.contains("is-open") ? closeNav() : openNav();
  };

  /* ---------------------------------------------------------------------
     Newsletter form — front-end only confirmation message
     --------------------------------------------------------------------- */
  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector(".newsletter-form__status");
    if (status) {
      status.textContent = "Thanks — please check your inbox to confirm your subscription.";
      status.dataset.state = "success";
    }
    form.reset();
  };

  /* ---------------------------------------------------------------------
     Hero video — autoplays, "Play/Pause Video" button toggles playback
     --------------------------------------------------------------------- */
  const heroVideo = document.querySelector("[data-hero-video]");
  const heroVideoToggle = document.querySelector("[data-video-toggle]");
  const heroVideoLabel = document.querySelector("[data-video-label]");

  if (heroVideo && heroVideoToggle) {
    const syncVideoToggle = () => {
      const isPlaying = !heroVideo.paused && !heroVideo.ended;
      heroVideoToggle.classList.toggle("is-playing", isPlaying);
      heroVideoToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      if (heroVideoLabel) heroVideoLabel.textContent = isPlaying ? "Pause Video" : "Play Video";
    };

    heroVideoToggle.addEventListener("click", () => {
      if (heroVideo.paused) {
        heroVideo.play();
      } else {
        heroVideo.pause();
      }
    });

    heroVideo.addEventListener("play", syncVideoToggle);
    heroVideo.addEventListener("pause", syncVideoToggle);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroVideo.pause();
    }

    syncVideoToggle();
  }

  /* ---------------------------------------------------------------------
     Projects carousel — side-peek scroll-snap track with dot + arrow nav
     --------------------------------------------------------------------- */
  const projectsTrack = document.querySelector("[data-projects-track]");
  const projectSlides = document.querySelectorAll("[data-project-slide]");
  const projectsDots = document.querySelectorAll("[data-projects-dot]");
  const projectsNext = document.querySelector("[data-projects-next]");

  if (projectsTrack && projectSlides.length) {
    let activeProjectIndex = 0;

    const scrollToProjectSlide = (index) => {
      const slide = projectSlides[index];
      if (!slide) return;
      const trackRect = projectsTrack.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const offset = slideRect.left - trackRect.left + projectsTrack.scrollLeft;
      projectsTrack.scrollTo({ left: offset, behavior: "smooth" });
    };

    const setActiveProjectDot = (index) => {
      activeProjectIndex = index;
      projectsDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
    };

    if ("IntersectionObserver" in window) {
      const projectsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = Array.from(projectSlides).indexOf(entry.target);
            if (index !== -1) setActiveProjectDot(index);
          });
        },
        { root: projectsTrack, threshold: 0.6 }
      );

      projectSlides.forEach((slide) => projectsObserver.observe(slide));
    }

    projectsDots.forEach((dot, index) => {
      dot.addEventListener("click", () => scrollToProjectSlide(index));
    });

    if (projectsNext) {
      projectsNext.addEventListener("click", () => {
        const nextIndex = (activeProjectIndex + 1) % projectSlides.length;
        scrollToProjectSlide(nextIndex);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Testimonials carousel — cycles quote + author pairs
     --------------------------------------------------------------------- */
  const testimonialQuotes = document.querySelectorAll("[data-testimonial-quotes] > .testimonial__quote");
  const testimonialAuthors = document.querySelectorAll("[data-testimonial-authors] > .testimonial__author");
  const testimonialPrev = document.querySelector("[data-testimonial-prev]");
  const testimonialNext = document.querySelector("[data-testimonial-next]");

  if (testimonialQuotes.length && testimonialAuthors.length) {
    let activeTestimonial = 0;

    const showTestimonial = (index) => {
      activeTestimonial = (index + testimonialQuotes.length) % testimonialQuotes.length;
      testimonialQuotes.forEach((el, i) => el.classList.toggle("is-active", i === activeTestimonial));
      testimonialAuthors.forEach((el, i) => el.classList.toggle("is-active", i === activeTestimonial));
    };

    if (testimonialPrev) {
      testimonialPrev.addEventListener("click", () => showTestimonial(activeTestimonial - 1));
    }

    if (testimonialNext) {
      testimonialNext.addEventListener("click", () => showTestimonial(activeTestimonial + 1));
    }
  }

  /* ---------------------------------------------------------------------
     Leadership carousel — side-by-side track with prev/next arrow nav
     --------------------------------------------------------------------- */
  const leadershipTrack = document.querySelector("[data-leadership-track]");
  const leadershipSlides = document.querySelectorAll("[data-leadership-slide]");
  const leadershipPrev = document.querySelector("[data-leadership-prev]");
  const leadershipNext = document.querySelector("[data-leadership-next]");

  if (leadershipTrack && leadershipSlides.length) {
    let activeLeadershipIndex = 0;

    const scrollToLeadershipSlide = (index) => {
      activeLeadershipIndex = Math.max(0, Math.min(index, leadershipSlides.length - 1));
      const slide = leadershipSlides[activeLeadershipIndex];
      const trackRect = leadershipTrack.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const offset = slideRect.left - trackRect.left + leadershipTrack.scrollLeft;
      leadershipTrack.scrollTo({ left: offset, behavior: "smooth" });
    };

    if (leadershipPrev) {
      leadershipPrev.addEventListener("click", () => scrollToLeadershipSlide(activeLeadershipIndex - 1));
    }

    if (leadershipNext) {
      leadershipNext.addEventListener("click", () => scrollToLeadershipSlide(activeLeadershipIndex + 1));
    }
  }

  /* ---------------------------------------------------------------------
     Leadership bio modal — populates from each team card's data attributes
     --------------------------------------------------------------------- */
  const teamModal = document.querySelector("[data-team-modal]");
  const teamTriggers = document.querySelectorAll("[data-team-trigger]");

  if (teamModal && teamTriggers.length) {
    const teamModalClosers = teamModal.querySelectorAll("[data-team-modal-close]");
    const teamModalMedia = teamModal.querySelector("[data-team-modal-media]");
    const teamModalName = teamModal.querySelector("[data-team-modal-name]");
    const teamModalRole = teamModal.querySelector("[data-team-modal-role]");
    const teamModalContact = teamModal.querySelector("[data-team-modal-contact]");
    const teamModalBio = teamModal.querySelector("[data-team-modal-bio]");
    const teamModalClose = teamModal.querySelector(".team-modal__close");

    const placeholderIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>';

    let lastFocusedTrigger = null;

    const openTeamModal = (trigger) => {
      const { name, role, phone, email, image, bio } = trigger.dataset;

      teamModalName.textContent = name || "";
      teamModalRole.textContent = role || "";
      teamModalBio.textContent = bio || "";

      teamModalContact.innerHTML = "";
      if (phone) {
        const phoneLink = document.createElement("a");
        phoneLink.href = `tel:${phone.replace(/\s+/g, "")}`;
        phoneLink.textContent = phone;
        teamModalContact.appendChild(phoneLink);
      }
      if (email) {
        const emailLink = document.createElement("a");
        emailLink.href = `mailto:${email}`;
        emailLink.textContent = email;
        teamModalContact.appendChild(emailLink);
      }

      teamModalMedia.innerHTML = "";
      if (image) {
        teamModalMedia.classList.remove("team-card__placeholder");
        const img = document.createElement("img");
        img.src = image;
        img.alt = `Portrait of ${name}`;
        teamModalMedia.appendChild(img);
      } else {
        teamModalMedia.classList.add("team-card__placeholder");
        teamModalMedia.innerHTML = placeholderIcon;
      }

      lastFocusedTrigger = trigger;
      teamModal.classList.add("is-open");
      teamModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("nav-open");
      window.requestAnimationFrame(() => teamModalClose && teamModalClose.focus());
    };

    const closeTeamModal = () => {
      teamModal.classList.remove("is-open");
      teamModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("nav-open");
      if (lastFocusedTrigger) lastFocusedTrigger.focus();
    };

    teamTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openTeamModal(trigger));
    });

    teamModalClosers.forEach((btn) => btn.addEventListener("click", closeTeamModal));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && teamModal.classList.contains("is-open")) {
        closeTeamModal();
      }
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-reveal animations (fade-up, image reveal, staggered entrances)
     --------------------------------------------------------------------- */
  // Hero content is always in the initial viewport, so reveal it immediately
  // rather than waiting on the IntersectionObserver's bottom rootMargin.
  document
    .querySelectorAll(".hero .reveal, .hero .reveal-image, .hero .reveal-stagger")
    .forEach((el) => el.classList.add("is-visible"));

  const revealEls = document.querySelectorAll(".reveal, .reveal-image, .reveal-stagger");

  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach((el) => revealObserver.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------------------------------------------------------------------
     Bindings
     --------------------------------------------------------------------- */
  updateHeaderScrollState();
  window.addEventListener("scroll", updateHeaderScrollState, { passive: true });

  menuToggle.addEventListener("click", toggleNav);

  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      toggleSearch();
      closeNav();
    });
  }

  if (newsletterTrigger) {
    newsletterTrigger.addEventListener("click", () => {
      openNav();
      window.requestAnimationFrame(() => newsletterEmail && newsletterEmail.focus());
    });
  }

  navOverlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (navOverlay.classList.contains("is-open")) closeNav();
    closeSearch();
  });

  newsletterForms.forEach((form) => form.addEventListener("submit", handleNewsletterSubmit));
})();
