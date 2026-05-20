(function () {
  const menuBtn = document.getElementById("menuBtn");
  const siteNav = document.getElementById("siteNav");

  if (menuBtn && siteNav) {
    menuBtn.addEventListener("click", () => {
      const open = siteNav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const slides = document.querySelectorAll(".hero-slide");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const dotsWrap = document.getElementById("heroDots");

  if (slides.length && prevBtn && nextBtn && dotsWrap) {
    let index = 0;
    let timer = null;

    const videos = Array.from(slides).map((s) => s.querySelector(".hero-slide__video"));

    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `슬라이드 ${i + 1}`);
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    });

    const dots = () => dotsWrap.querySelectorAll("button");

    function syncVideo() {
      videos.forEach((v, i) => {
        if (!v) return;
        if (i === index) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }

    function go(next) {
      const n = (next + slides.length) % slides.length;
      index = n;
      slides.forEach((el, i) => {
        el.classList.toggle("is-active", i === n);
      });
      dots().forEach((d, i) => {
        d.setAttribute("aria-selected", i === n ? "true" : "false");
      });
      syncVideo();
    }

    function next() {
      go(index + 1);
    }

    function prev() {
      go(index - 1);
    }

    function armTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 9000);
    }

    prevBtn.addEventListener("click", () => {
      prev();
      armTimer();
    });

    nextBtn.addEventListener("click", () => {
      next();
      armTimer();
    });

    go(0);
    armTimer();
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const prevLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "전송 중…";
      }
      const thanksUrl = new URL("thank-you.html", window.location.href).href;
      const payload = Object.fromEntries(new FormData(contactForm).entries());
      try {
        const res = await fetch("/.netlify/functions/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          window.alert(
            "문의 API를 찾을 수 없습니다. Netlify에 Functions가 배포됐는지 확인해 주세요."
          );
          return;
        }
        if (res.status === 403 && !data.message) {
          window.alert(
            "접근이 거부되었습니다. Netlify 사이트 비밀번호 보호를 끄거나, Functions·환경변수 설정을 확인해 주세요."
          );
          return;
        }
        if (data && data.success === true) {
          window.location.assign(thanksUrl);
          return;
        }
        window.alert(
          (data && data.message) || "전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
      } catch {
        window.alert(
          "네트워크 오류입니다. Netlify에 배포된 주소에서 다시 시도해 주세요.\n(로컬 파일로 열면 문의 전송이 되지 않을 수 있습니다.)"
        );
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
      }
    });
  }
})();
