(function () {
  document.documentElement.classList.add("js");

  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const videos = Array.from(document.querySelectorAll("[data-video-src]"));

  const setMenuState = (open) => {
    if (!navToggle || !navMenu) {
      return;
    }

    navToggle.setAttribute("aria-expanded", String(open));
    navMenu.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) {
        setMenuState(false);
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });
  }

  const showReveals = () => {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  };

  if (reducedMotion.matches) {
    showReveals();
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (videos.length > 0) {
    const startVideo = (video) => {
      const source = video.dataset.videoSrc;
      if (!source || video.dataset.loaded === "true") {
        return;
      }

      video.src = source;
      video.dataset.loaded = "true";

      if (reducedMotion.matches) {
        video.removeAttribute("autoplay");
        video.controls = true;
        return;
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          video.controls = true;
        });
      }
    };

    if (reducedMotion.matches) {
      videos.forEach((video) => startVideo(video));
    } else {
      const videoObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            startVideo(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.3,
        }
      );

      videos.forEach((video) => videoObserver.observe(video));
    }
  }

  if (navLinks.length > 0) {
    const sectionMap = navLinks
      .map((link) => {
        const id = link.getAttribute("href");
        if (!id || !id.startsWith("#")) {
          return null;
        }

        const section = document.querySelector(id);
        if (!section) {
          return null;
        }

        return { link, section };
      })
      .filter(Boolean);

    if (sectionMap.length > 0) {
      const linkObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const match = sectionMap.find((item) => item.section === entry.target);
            if (!match) {
              return;
            }

            if (entry.isIntersecting) {
              navLinks.forEach((link) => link.classList.remove("is-active"));
              match.link.classList.add("is-active");
            }
          });
        },
        {
          threshold: 0.35,
          rootMargin: "-20% 0px -55% 0px",
        }
      );

      sectionMap.forEach(({ section }) => linkObserver.observe(section));
    }
  }
})();
