const GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycby1KdIbdqu9ctnnKmSqzaQfxr_twjdTSH3cI8Dk76CiZc61gXRxdiloA8lpv1XuF5-34g/exec";

const WEDDING_DATE = new Date("2026-04-20T00:00:00+05:30");

const q = (selector, scope = document) => scope.querySelector(selector);
const qa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initNav() {
  const toggle = q(".nav-toggle");
  const menu = q("#nav-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("open");
  });

  qa(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initSmoothScroll() {
  qa("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-scroll-to");
      const element = target ? q(target) : null;
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initParallax() {
  const hero = q(".hero");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY * 0.28;
      hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const items = qa(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((item) => observer.observe(item));
}

function twoDigits(value) {
  return String(value).padStart(2, "0");
}

function runFireworks(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.classList.add("active");
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = canvas.clientWidth || 1200;
  const logicalHeight = 320;
  canvas.width = Math.floor(logicalWidth * dpr);
  canvas.height = Math.floor(logicalHeight * dpr);
  ctx.scale(dpr, dpr);

  const particles = [];
  const colors = ["#f7d889", "#f4c66a", "#ffffff", "#9f6a1f", "#1f5b45"];

  function burst(x, y) {
    for (let i = 0; i < 38; i += 1) {
      const angle = (Math.PI * 2 * i) / 38;
      const speed = Math.random() * 2.5 + 1.3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 55 + Math.random() * 35,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  burst(logicalWidth * 0.25, 120);
  burst(logicalWidth * 0.5, 80);
  burst(logicalWidth * 0.75, 130);

  let frame = 0;
  function animate() {
    frame += 1;
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life -= 1;
      ctx.globalAlpha = Math.max(0, p.life / 80);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    if (frame < 200 && particles.length) {
      requestAnimationFrame(animate);
    } else {
      ctx.globalAlpha = 1;
    }
  }

  animate();
}

function initCountdown() {
  const days = q("#days");
  const hours = q("#hours");
  const minutes = q("#minutes");
  const seconds = q("#seconds");
  const marriedMessage = q("#married-message");
  const fireworksCanvas = q("#fireworks");
  const heartbeatEl = q("#heartbeat-count");

  const ringDays = q("#ring-days");
  const ringHours = q("#ring-hours");
  const ringMinutes = q("#ring-minutes");
  const ringSeconds = q("#ring-seconds");

  if (!days || !hours || !minutes || !seconds || !marriedMessage || !fireworksCanvas) return;

  const C = 2 * Math.PI * 62;
  const TOTAL_DAYS = 365;
  let fireworksStarted = false;
  let prevSec = -1;

  function setRing(el, value, max) {
    if (!el) return;
    el.style.strokeDashoffset = C * (1 - value / max);
  }

  function setRingInstant(el, value, max) {
    if (!el) return;
    el.style.transition = "none";
    el.style.strokeDashoffset = C * (1 - value / max);
    el.offsetHeight;
    el.style.transition = "";
  }

  const tick = () => {
    const now = new Date();
    const diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      days.textContent = "00";
      hours.textContent = "00";
      minutes.textContent = "00";
      seconds.textContent = "00";
      setRing(ringDays, 1, 1);
      setRing(ringHours, 1, 1);
      setRing(ringMinutes, 1, 1);
      setRing(ringSeconds, 1, 1);
      marriedMessage.hidden = false;
      if (heartbeatEl) heartbeatEl.textContent = "\u221E";
      if (!fireworksStarted) {
        fireworksStarted = true;
        runFireworks(fireworksCanvas);
      }
      return;
    }

    const dayCount = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hourCount = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minuteCount = Math.floor((diff / (1000 * 60)) % 60);
    const secondCount = Math.floor((diff / 1000) % 60);

    days.textContent = twoDigits(dayCount);
    hours.textContent = twoDigits(hourCount);
    minutes.textContent = twoDigits(minuteCount);
    seconds.textContent = twoDigits(secondCount);

    setRing(ringDays, Math.min(dayCount, TOTAL_DAYS), TOTAL_DAYS);
    setRing(ringHours, hourCount, 24);
    setRing(ringMinutes, minuteCount, 60);

    if (secondCount > prevSec && prevSec !== -1) {
      setRingInstant(ringSeconds, secondCount, 60);
    } else {
      setRing(ringSeconds, secondCount, 60);
    }
    prevSec = secondCount;
  };

  tick();
  setInterval(tick, 1000);

  if (heartbeatEl) {
    const updateBeats = () => {
      const diff = WEDDING_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      const beats = Math.floor((diff / 1000) * 2.4);
      heartbeatEl.textContent = beats.toLocaleString("en-IN");
    };
    updateBeats();
    setInterval(updateBeats, 100);
  }
}

function initPetals() {
  const container = q(".petal-container");
  if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const colors = ["#f5a623", "#e8912d", "#f7c948", "#d4781a", "#f9d56e", "#e6a817"];
  const shapes = ["50% 0 50% 50%", "0 50% 50% 50%", "50% 50% 0 50%", "50% 50% 50% 0"];

  for (let i = 0; i < 18; i++) {
    const petal = document.createElement("div");
    petal.className = "marigold-petal";
    const size = 7 + Math.random() * 10;
    petal.style.width = size + "px";
    petal.style.height = size * 1.35 + "px";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.background = colors[Math.floor(Math.random() * colors.length)];
    petal.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    petal.style.animationDelay = (Math.random() * 12) + "s";
    petal.style.animationDuration = (8 + Math.random() * 9) + "s";
    container.appendChild(petal);
  }
}

function initECG() {
  const svg = q(".ecg-line");
  if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const seg = 120;
  const count = 22;
  const w = seg * count;
  const y = 30;

  svg.setAttribute("viewBox", "0 0 " + w + " 60");

  let d = "M0," + y;
  for (let i = 0; i < count; i++) {
    const x = i * seg;
    d += " L" + (x + 28) + "," + y;
    d += " Q" + (x + 34) + "," + (y - 6) + " " + (x + 40) + "," + y;
    d += " L" + (x + 48) + "," + y;
    d += " L" + (x + 51) + "," + (y + 4);
    d += " L" + (x + 54) + "," + (y - 22);
    d += " L" + (x + 57) + "," + (y + 14);
    d += " L" + (x + 60) + "," + y;
    d += " L" + (x + 68) + "," + y;
    d += " Q" + (x + 76) + "," + (y - 8) + " " + (x + 84) + "," + y;
    d += " L" + (x + seg) + "," + y;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("class", "ecg-path");
  svg.appendChild(path);
}

function toICSDate(localDateInput) {
  const local = new Date(localDateInput);
  return local.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function downloadICS(details) {
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@ourwedding.local`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(details.start);
  const dtend = toICSDate(details.end);
  const esc = (v) => String(v).replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Our Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${esc(details.title)}`,
    `DESCRIPTION:${esc(details.description)}`,
    `LOCATION:${esc(details.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${details.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function initCalendarButtons() {
  qa(".add-calendar").forEach((button) => {
    button.addEventListener("click", () => {
      downloadICS({
        title: button.dataset.title || "Wedding Event",
        description: button.dataset.description || "Wedding celebration",
        location: button.dataset.location || "Harsh Udayan Resort, Aligarh",
        start: button.dataset.start || "2026-04-20T10:00:00",
        end: button.dataset.end || "2026-04-20T12:00:00",
      });
    });
  });
}

async function submitRsvp(form, statusEl) {
  const submitButton = q('button[type="submit"]', form);
  const formData = new FormData(form);
  const payload = new URLSearchParams({
    guestName: String(formData.get("guestName") || ""),
    guestCount: String(formData.get("guestCount") || "1"),
    attending: String(formData.get("attending") || ""),
    message: String(formData.get("message") || ""),
    submittedAt: new Date().toISOString(),
  });

  submitButton.disabled = true;
  statusEl.className = "form-status";
  statusEl.textContent = "Sending your RSVP...";

  try {
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString(),
    });

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    statusEl.classList.add("success");
    statusEl.textContent = "Thank you! Your RSVP has been received with love.";
    form.reset();
  } catch (error) {
    statusEl.classList.add("error");
    statusEl.textContent =
      "Oops, we could not send your RSVP right now. Please try again in a moment.";
    console.error("RSVP error:", error);
  } finally {
    submitButton.disabled = false;
  }
}

function initRsvp() {
  const form = q("#rsvp-form");
  const statusEl = q("#form-status");
  if (!form || !statusEl) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    submitRsvp(form, statusEl);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initSmoothScroll();
  initParallax();
  initReveal();
  initCountdown();
  initCalendarButtons();
  initRsvp();
  initPetals();
  initECG();
});
