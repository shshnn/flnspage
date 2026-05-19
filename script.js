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
    const keyInput = document.getElementById("web3formsAccessKey");
    const k =
      typeof window.WEB3FORMS_ACCESS_KEY === "string" ? window.WEB3FORMS_ACCESS_KEY.trim() : "";
    if (keyInput && k) {
      keyInput.value = k;
    }
    contactForm.addEventListener("submit", async (e) => {
      if (!keyInput || !keyInput.value.trim()) {
        e.preventDefault();
        window.alert(
          "문의 전송이 아직 연결되지 않았습니다.\n\nweb3forms-key.js 파일을 열고 WEB3FORMS_ACCESS_KEY에 키를 넣어 주세요.\n(무료 발급: https://web3forms.com)"
        );
        return;
      }
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const prevLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "전송 중…";
      }
      const thanksUrl = new URL("thank-you.html", window.location.href).href;
      try {
        const res = await fetch(contactForm.action, { method: "POST", body: new FormData(contactForm) });
        const data = await res.json().catch(() => ({}));
        if (data && data.success === true) {
          window.location.assign(thanksUrl);
          return;
        }
        window.alert(
          (data && data.message) || "전송에 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
      } catch {
        window.alert("네트워크 오류입니다. 연결을 확인한 뒤 다시 시도해 주세요.");
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
      }
    });
  }
})();
