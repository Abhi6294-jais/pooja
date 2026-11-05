// ============================================
// 🙏 PoojaPath — Main Application Logic
// ============================================

// ══════════════════════════════════════
// ── BUSINESS CONFIG (Easy to update)
// ══════════════════════════════════════
const BUSINESS = {
  name: "Maa Bhawani Enterprises",
  shortName: "M.B.E.",
  phone: "919434428105", // WhatsApp number (country code + number, no +)
  displayPhone: "+91 94344 28105",
  email: "ghanshyamtiwari086@gmail.com",
  upiId: "ghanshyamtiwari086-1@okicici", // Your UPI ID
  upiName: "Maa Bhawani Enterprises",
  address: "Champasari, Jyoti Nagar, 734003, Near Dhaka Loudge, Siliguri, West Bengal",
  whatsappGreeting:
    "Namaste!%20I%20want%20to%20know%20more%20about%20your%20pooja%20services.",
};

// ── State ──
let cart = JSON.parse(localStorage.getItem("poojapath_cart")) || [];
let orders = JSON.parse(localStorage.getItem("poojapath_orders")) || [];
let currentPage = "home";
let searchQuery = "";
let poojaSearchQuery = "";
let activeCategory = "all";
let currentLang = localStorage.getItem("poojapath_lang_pref");
if (!currentLang) {
  currentLang = "hi";
  localStorage.setItem("poojapath_lang_pref", "hi");
  localStorage.setItem("poojapath_lang", "hi");
}
let visibleTestimonialsCount = 3;

let customReviews = JSON.parse(localStorage.getItem("poojapath_reviews")) || [];
if (!TESTIMONIALS._customAdded) {
  TESTIMONIALS.unshift(...customReviews);
  TESTIMONIALS._customAdded = true;
}

// ── Translation Helper ──
function t(key) {
  return (LANG[currentLang] && LANG[currentLang][key]) || LANG.en[key] || key;
}

function localName(item) {
  if (currentLang === "hi") {
    if (item.nameHi) return item.nameHi;
    const prod = typeof PRODUCTS !== "undefined" && PRODUCTS.find((p) => p.id === item.id);
    if (prod && prod.nameHi) return prod.nameHi;
    const serv = typeof POOJA_SERVICES !== "undefined" && POOJA_SERVICES.find((s) => s.id === item.id);
    if (serv && serv.nameHi) return serv.nameHi;
    if (item.localName) return item.localName;
  }
  return item.name;
}
function localDesc(item) {
  return currentLang === "hi" && (item.descHi || item.descriptionHi)
    ? item.descHi || item.descriptionHi
    : item.description;
}
function localDuration(item) {
  return currentLang === "hi" && item.durationHi
    ? item.durationHi
    : item.duration;
}
function localIncludes(item) {
  return currentLang === "hi" && item.includesHi
    ? item.includesHi
    : item.includes;
}
function localText(item) {
  return currentLang === "hi" && item.textHi ? item.textHi : item.text;
}
function localLocation(item) {
  return currentLang === "hi" && item.locationHi
    ? item.locationHi
    : item.location;
}

// ── Dynamic Calendar Icon ──
function getDynamicCalendarIcon() {
  const now = new Date();
  const day = now.getDate();
  const monthNamesEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const monthNamesHi = ["जन", "फ़र", "मार्च", "अप्रै", "मई", "जून", "जुला", "अग", "सितं", "अक्तू", "नवं", "दिसं"];
  const month = (currentLang === "hi" ? monthNamesHi : monthNamesEn)[now.getMonth()];
  const fullDate = now.toLocaleDateString(currentLang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return `<svg class="dynamic-calendar-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${fullDate}"><title>${fullDate}</title><rect x="2.5" y="3.5" width="19" height="18.5" rx="3.5" fill="#ffffff" stroke="#d4a017" stroke-width="1.3"/><path d="M2.5 7C2.5 5.067 4.067 3.5 6 3.5H18C19.933 3.5 21.5 5.067 21.5 7V8.5H2.5V7Z" fill="#b91c1c"/><rect x="6.5" y="1.5" width="2" height="4" rx="1" fill="#ffffff" stroke="#881337" stroke-width="0.5"/><rect x="15.5" y="1.5" width="2" height="4" rx="1" fill="#ffffff" stroke="#881337" stroke-width="0.5"/><text x="12" y="6.3" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="'Outfit', -apple-system, sans-serif" font-weight="700" font-size="3.5" letter-spacing="0.5">${month}</text><text x="12" y="15.3" text-anchor="middle" dominant-baseline="central" fill="#1a0f0a" font-family="'Outfit', -apple-system, sans-serif" font-weight="800" font-size="9.5">${day}</text></svg>`;
}

// ── Order ID Generator ──
function generateOrderId() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return "PP" + datePart + randomPart;
}

// ── Dynamic WhatsApp Greetings & Messages ──
function getWhatsAppGreeting(type = "general") {
  const isHi = currentLang === "hi";
  if (type === "consult") {
    return isHi
      ? "नमस्ते पंडित जी! मैं माँ भवानी एंटरप्राइजेज की पूजा सेवाओं और अनुष्ठानों के बारे में परामर्श करना चाहता/चाहती हूँ।"
      : "Namaste Pandit Ji! I would like to consult with you regarding pooja services and rituals.";
  }
  return isHi
    ? "नमस्ते! मैं माँ भवानी एंटरप्राइजेज की पूजा सेवाओं के बारे में और जानकारी चाहता/चाहती हूँ।"
    : "Namaste! I want to know more about your pooja services.";
}

function askOrderStatus(orderId) {
  const isHi = currentLang === "hi";
  const msg = isHi
    ? `नमस्ते! मैं अपने ऑर्डर (${orderId}) की वर्तमान स्थिति (status) जानना चाहता/चाहती हूँ। कृपया मुझे जानकारी प्रदान करें।`
    : `Namaste! I would like to check the current status of my order (${orderId}). Please provide an update.`;
  openWhatsApp(msg);
}

// ── WhatsApp Message Builder ──
function buildWhatsAppOrderMsg(orderData) {
  const isHi = currentLang === "hi";

  const items = orderData.items
    .map((item) => {
      const name = localName(item);
      return `• ${item.emoji || "🛕"} ${name} ×${item.qty} = ₹${(
        item.price * item.qty
      ).toLocaleString("en-IN")}`;
    })
    .join("\n");

  const deliveryStr =
    orderData.delivery === 0
      ? isHi
        ? "मुफ़्त (FREE)"
        : "FREE"
      : "₹" + orderData.delivery.toLocaleString("en-IN");

  const isUPI =
    orderData.paymentType === "upi" ||
    (orderData.paymentMethod && orderData.paymentMethod.includes("UPI"));

  const paymentMethodStr = isUPI
    ? isHi
      ? "UPI (ऑनलाइन)"
      : "UPI (Online)"
    : isHi
    ? "कैश ऑन डिलीवरी (COD)"
    : "Cash on Delivery (COD)";

  const paymentStatusStr = isUPI
    ? isHi
      ? "सत्यापन प्रक्रिया में (Pending Verification)"
      : "Pending Verification"
    : isHi
    ? "डिलीवरी पर देय (Pay on Delivery)"
    : "Pay on Delivery";

  let msg = "";
  if (isHi) {
    msg = `🙏 *नया ऑर्डर — ${BUSINESS.name}*

📋 *ऑर्डर आईडी:* ${orderData.orderId}
📅 *दिनांक:* ${orderData.date || new Date().toISOString().split("T")[0]}
${orderData.time ? `⏰ *समय:* ${orderData.time}\n` : ""}
👤 *ग्राहक:* ${orderData.customerName}
📞 *फ़ोन नंबर:* ${orderData.customerPhone}
✉️ *ईमेल:* ${orderData.customerEmail || "—"}
📍 *डिलीवरी पता:* ${orderData.customerAddress}

🛒 *ऑर्डर की गई सामग्री:*
${items}

💰 *उप-योग:* ₹${orderData.subtotal.toLocaleString("en-IN")}
🚚 *डिलीवरी शुल्क:* ${deliveryStr}
━━━━━━━━━━━━━━━
💵 *कुल राशि:* ₹${orderData.grandTotal.toLocaleString("en-IN")}

💳 *भुगतान का तरीका:* ${paymentMethodStr}
✅ *भुगतान स्थिति:* ${paymentStatusStr}

🙏 कृपया इस ऑर्डर की पुष्टि करें।

━━━━━━━━━━━━━━━
_पुष्टि के लिए उत्तर दें:_
✅ *ऑर्डर कन्फर्म (Order Confirmed)*
_या_
🚚 *ऑर्डर भेजा गया (Order Dispatched)*`;
  } else {
    msg = `🙏 *NEW ORDER — ${BUSINESS.name}*

📋 *Order ID:* ${orderData.orderId}
📅 *Date:* ${orderData.date || new Date().toISOString().split("T")[0]}
${orderData.time ? `⏰ *Time:* ${orderData.time}\n` : ""}
👤 *Customer:* ${orderData.customerName}
📞 *Phone:* ${orderData.customerPhone}
✉️ *Email:* ${orderData.customerEmail || "—"}
📍 *Address:* ${orderData.customerAddress}

🛒 *Order Items:*
${items}

💰 *Subtotal:* ₹${orderData.subtotal.toLocaleString("en-IN")}
🚚 *Delivery:* ${deliveryStr}
━━━━━━━━━━━━━━━
💵 *Total:* ₹${orderData.grandTotal.toLocaleString("en-IN")}

💳 *Payment:* ${paymentMethodStr}
✅ *Payment Status:* ${paymentStatusStr}

🙏 Please confirm this order.

━━━━━━━━━━━━━━━
_To confirm, reply:_
✅ *Order Confirmed*
_or_
🚚 *Order Dispatched*`;
  }

  return encodeURIComponent(msg);
}

function buildWhatsAppBookingMsg(bookingData) {
  const isHi = currentLang === "hi";

  let msg = "";
  if (isHi) {
    msg = `🙏 *नई पूजा बुकिंग — ${BUSINESS.name}*

📋 *बुकिंग आईडी:* ${bookingData.bookingId}

🕉️ *पूजा सेवा:* ${bookingData.poojaName}
💰 *दक्षिणा / मूल्य:* ₹${Number(bookingData.price).toLocaleString("en-IN")}

👤 *यजमान / नाम:* ${bookingData.customerName}
📞 *फ़ोन नंबर:* ${bookingData.customerPhone}
📅 *दिनांक:* ${bookingData.date}
⏰ *समय / मुहूर्त:* ${bookingData.time}
📍 *पूजा स्थल / पता:* ${bookingData.address}
${bookingData.notes ? `📝 *विशेष विवरण:* ${bookingData.notes}\n` : ""}
🙏 कृपया इस पूजा बुकिंग की पुष्टि करें।`;
  } else {
    msg = `🙏 *NEW BOOKING — ${BUSINESS.name}*

📋 *Booking ID:* ${bookingData.bookingId}

🕉️ *Service:* ${bookingData.poojaName}
💰 *Price:* ₹${Number(bookingData.price).toLocaleString("en-IN")}

👤 *Name:* ${bookingData.customerName}
📞 *Phone:* ${bookingData.customerPhone}
📅 *Date:* ${bookingData.date}
⏰ *Time:* ${bookingData.time}
📍 *Address:* ${bookingData.address}
${bookingData.notes ? `📝 *Notes:* ${bookingData.notes}\n` : ""}
🙏 Please confirm this booking.`;
  }

  return encodeURIComponent(msg);
}

function buildWhatsAppContactMsg(contactData) {
  const isHi = currentLang === "hi";

  let msg = "";
  if (isHi) {
    msg = `📩 *नया संदेश — ${BUSINESS.name}*

👤 *नाम:* ${contactData.name}
📞 *फ़ोन नंबर:* ${contactData.phone}
✉️ *ईमेल:* ${contactData.email || "—"}
📌 *विषय:* ${contactData.subject || "सामान्य पूछताछ"}

💬 *संदेश:*
${contactData.message}`;
  } else {
    msg = `📩 *NEW MESSAGE — ${BUSINESS.name}*

👤 *Name:* ${contactData.name}
📞 *Phone:* ${contactData.phone}
✉️ *Email:* ${contactData.email || "—"}
📌 *Subject:* ${contactData.subject || "General"}

💬 *Message:*
${contactData.message}`;
  }

  return encodeURIComponent(msg);
}

function openWhatsApp(msg, type = "general") {
  let text = msg;
  if (!text || text === BUSINESS.whatsappGreeting) {
    text = getWhatsAppGreeting(type);
  }
  const isAlreadyEncoded = typeof text === "string" && /%[0-9A-Fa-f]{2}/.test(text);
  const encoded = isAlreadyEncoded ? text : encodeURIComponent(text);
  const url = `https://wa.me/${BUSINESS.phone}?text=${encoded}`;
  window.open(url, "_blank");
}

// ── GPS Location Detection ──
function detectLocation(targetId) {
  const btn = document.getElementById(targetId + "LocBtn");
  const textarea = document.getElementById(targetId);
  if (!navigator.geolocation) {
    showToast(t("loc_not_supported"), "❌");
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = "📍 " + t("loc_detecting"); }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      // Reverse geocode via Nominatim (free, no key)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=${currentLang === 'hi' ? 'hi' : 'en'}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            textarea.value = data.display_name;
            showToast(t("loc_detected"), "📍");
          } else {
            textarea.value = `Lat: ${latitude}, Lng: ${longitude}`;
            showToast(t("loc_coords_only"), "📍");
          }
          if (btn) { btn.disabled = false; btn.textContent = "📍 " + t("loc_detect"); }
        })
        .catch(() => {
          textarea.value = `Lat: ${latitude}, Lng: ${longitude}`;
          showToast(t("loc_coords_only"), "📍");
          if (btn) { btn.disabled = false; btn.textContent = "📍 " + t("loc_detect"); }
        });
    },
    (err) => {
      showToast(t("loc_denied"), "❌");
      if (btn) { btn.disabled = false; btn.textContent = "📍 " + t("loc_detect"); }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ── UPI QR Code Generator ──
function getUpiQrUrl(amount, orderId) {
  const upiLink = `upi://pay?pa=${BUSINESS.upiId}&pn=${encodeURIComponent(
    BUSINESS.upiName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    "Order " + orderId + " - " + BUSINESS.name
  )}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiLink
  )}&bgcolor=1a0f0a&color=ffd700`;
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  createParticles();
  applyLanguage();
  handleRoute();
  updateCartBadge();
  setupNavbarScroll();
  setupScrollReveal();
  window.addEventListener("hashchange", handleRoute);

  // Mouse Aura Effect
  document.addEventListener("mousemove", (e) => {
    document.body.style.setProperty("--mouse-x", `${e.clientX}px`);
    document.body.style.setProperty("--mouse-y", `${e.clientY}px`);
  });
});

// ── Language Toggle ──
function toggleLanguage() {
  currentLang = currentLang === "en" ? "hi" : "en";
  localStorage.setItem("poojapath_lang_pref", currentLang);
  localStorage.setItem("poojapath_lang", currentLang);
  applyLanguage();
  navigateTo(currentPage, false);
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  const langLabel = document.getElementById("langLabel");
  const langToggle = document.getElementById("langToggle");
  if (langLabel) langLabel.textContent = t("lang_toggle");
  if (langToggle) {
    langToggle.classList.toggle("hi", currentLang === "hi");
    langToggle.title = currentLang === "hi" ? "Switch to English" : "हिंदी में बदलें";
  }

  const ids = {
    navHome: "nav_home",
    navPooja: "nav_book_pooja",
    navAbout: "nav_about",
    navContact: "nav_contact",
    navCart: "nav_cart",
  };
  Object.entries(ids).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  });

  // Orders link with emoji prefix
  const navOrders = document.getElementById("navOrders");
  if (navOrders) navOrders.textContent = "📋 " + t("nav_orders");

  renderFooter();
}

// ── Checkout & Payment ──
function submitReview() {
  const name = document.getElementById("reviewName").value.trim();
  const location = document.getElementById("reviewLocation").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);
  const text = document.getElementById("reviewText").value.trim();

  if (!name || !text) {
    showToast(t("review_fill_required"), "⚠️");
    return;
  }

  const newReview = {
    id: Date.now(),
    name: name,
    location: location || "India",
    locationHi: location || "भारत",
    text: text,
    textHi: text,
    rating: rating,
    avatar: "👤"
  };

  customReviews.unshift(newReview);
  localStorage.setItem("poojapath_reviews", JSON.stringify(customReviews));
  TESTIMONIALS.unshift(newReview);
  
  closeModal();
  showToast(t("review_submitted"), "✨");
  
  if (currentPage === "home") {
    visibleTestimonialsCount = 3;
    document.getElementById("testimonialSlider").innerHTML = renderTestimonialCards();
    setupScrollReveal();
  }
}

function openReviewModal() {
  const bodyHTML = `
    <div class="form-group">
      <label>${t("review_name")} <span style="color:var(--clr-primary)">*</span></label>
      <input type="text" id="reviewName" class="form-input" placeholder="${t("review_placeholder_name")}" />
    </div>
    <div class="form-group">
      <label>${t("review_location")}</label>
      <input type="text" id="reviewLocation" class="form-input" placeholder="${t("review_placeholder_loc")}" />
    </div>
    <div class="form-group">
      <label>${t("review_rating")} (1-5)</label>
      <select id="reviewRating" class="form-input">
        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
        <option value="4">⭐⭐⭐⭐ (4)</option>
        <option value="3">⭐⭐⭐ (3)</option>
        <option value="2">⭐⭐ (2)</option>
        <option value="1">⭐ (1)</option>
      </select>
    </div>
    <div class="form-group">
      <label>${t("review_text")} <span style="color:var(--clr-primary)">*</span></label>
      <textarea id="reviewText" class="form-input" rows="4" placeholder="${t("review_placeholder_text")}"></textarea>
    </div>
  `;
  const footerHTML = `
    <button class="btn btn-primary" style="width:100%" onclick="submitReview()">${t("review_submit")}</button>
  `;
  openModal(t("review_modal_title"), bodyHTML, footerHTML);
}


// ── Router ──
function handleRoute() {
  const hash = window.location.hash.slice(1) || "home";
  navigateTo(hash, false);
}

function navigateTo(page, pushState = true) {
  currentPage = page;
  if (pushState) window.location.hash = page;

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  const navLinks = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  navLinks.classList.remove("open");
  hamburger.classList.remove("open");

  const app = document.getElementById("app");
  switch (page) {
    case "home":
      app.innerHTML = renderHomePage();
      break;
    case "shop":
      navigateTo("pooja");
      return;
    case "pooja":
      app.innerHTML = renderPoojaPage();
      break;
    case "cart":
      app.innerHTML = renderCartPage();
      break;
    case "orders":
      app.innerHTML = renderOrdersPage();
      break;
    case "about":
      app.innerHTML = renderAboutPage();
      break;
    case "contact":
      app.innerHTML = renderContactPage();
      break;
    default:
      app.innerHTML = renderHomePage();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(setupScrollReveal, 100);
}

// ── Navbar Scroll ──
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

// ── Mobile Menu ──
function toggleMobileMenu() {
  document.getElementById("navLinks").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("open");
}

// ── Particles ──
function createParticles() {
  const container = document.getElementById("particles");
  const emojis = ["✨", "🪔", "🌸", "⭐", "🔥", "💫"];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 12 + 8;
    p.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;font-size:${size}px;animation-delay:${
      Math.random() * 20
    }s;animation-duration:${Math.random() * 15 + 15}s;`;
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    container.appendChild(p);
  }
}

// ── Scroll Reveal ──
function setupScrollReveal() {
  const obs = new IntersectionObserver(
    (entries, observer) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );
  document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-inner").forEach((el) => {
    el.classList.remove("visible"); // reset in case of re-render
    obs.observe(el);
  });

  const countObs = new IntersectionObserver(
    (entries, observer) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCountUp(e.target);
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.1 }
  );

  document.querySelectorAll(".count-up").forEach((el) => {
    el.textContent = "0" + (el.getAttribute("data-suffix") || "");
    el.classList.remove("counted");
    countObs.observe(el);
  });
}

function animateCountUp(el) {
  if (el.classList.contains("counted")) return;
  el.classList.add("counted");
  
  const target = parseInt(el.getAttribute("data-target"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 4000;
  const start = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * target);
    el.textContent = currentVal + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }
  requestAnimationFrame(update);
}

// ── Footer ──
function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-content reveal reveal-inner" style="--td: 0.1s">
      <div>
        <div class="footer-brand"><span>🙏</span><span class="footer-brand-text">Maa Bhawani Enterprises</span></div>
        <p class="footer-desc">${t("footer_desc")}</p>
      </div>
      <div>
        <h4 class="footer-section-title">${t("footer_quick_links")}</h4>
        <div class="footer-links">
          <span class="footer-link" onclick="navigateTo('home')">${t("nav_home")}</span>
          <span class="footer-link" onclick="navigateTo('pooja')">${t("nav_book_pooja")}</span>
          <span class="footer-link" onclick="navigateTo('about')">${t("nav_about")}</span>
          <span class="footer-link" onclick="navigateTo('orders')">${t("nav_orders")}</span>
          <span class="footer-link" onclick="navigateTo('contact')">${t("nav_contact")}</span>
        </div>
      </div>
      <div>
        <h4 class="footer-section-title">${t("footer_popular_pooja")}</h4>
        <div class="footer-links">
          ${POOJA_SERVICES.filter((p) => p.popular)
            .slice(0, 5)
            .map(
              (p) =>
                `<span class="footer-link" onclick="navigateTo('pooja')">${localName(p)}</span>`
            )
            .join("")}
        </div>
      </div>
      <div>
        <h4 class="footer-section-title">${t("footer_contact_us")}</h4>
        <div class="footer-links">
          <span class="footer-link" onclick="openWhatsApp('${BUSINESS.whatsappGreeting}')">📞 ${BUSINESS.displayPhone}</span>
          <span class="footer-link">✉️ ${BUSINESS.email}</span>
          <span class="footer-link">📍 ${BUSINESS.address}</span>
          <span class="footer-link">⏰ ${t("contact_hours")}</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom reveal-scale" style="transition-delay: 0.5s">
      <span class="footer-copyright">${t("footer_copyright")}</span>
      <div class="footer-social">
        <span class="footer-social-link" title="WhatsApp" onclick="openWhatsApp('${BUSINESS.whatsappGreeting}')" style="cursor:pointer">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </span>
        <a href="https://www.instagram.com/gh_anshyam9489?igsh=Zmt2NmM3MGdpc3Q0" target="_blank" class="footer-social-link" title="Instagram" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        </a>
        <a href="https://youtube.com/@panditghanshyamtiwari5146?si=3DRiFh_jyKhWL7Ou" target="_blank" class="footer-social-link" title="YouTube" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
        <a href="https://www.facebook.com/share/1DCwSxzxsD/" target="_blank" class="footer-social-link" title="Facebook" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════
// ── PAGE RENDERERS
// ══════════════════════════════════════

// ── HOME ──
function renderHomePage() {
  const popularPooja = POOJA_SERVICES.filter((p) => p.popular);

  return `
    <div class="page">
      <section class="hero">
        <div class="hero-content">
          <div class="hero-om">🙏</div>
          <h1 class="hero-title">${t("hero_title")}</h1>
          <p class="hero-subtitle">${t("hero_subtitle")}</p>
          <div class="hero-buttons">
            <button class="btn btn-primary" onclick="navigateTo('pooja')">${getDynamicCalendarIcon()} ${t("hero_btn_book")}</button>
            <button class="btn btn-secondary hero-contact-btn" onclick="navigateTo('contact')">📞 ${t("nav_contact")}</button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="hero-stat-number count-up" data-target="500" data-suffix="+">500+</div><div class="hero-stat-label">${t("hero_stat_families")}</div></div>
            <div class="hero-stat"><div class="hero-stat-number count-up" data-target="50" data-suffix="+">50+</div><div class="hero-stat-label">${t("hero_stat_pandits")}</div></div>
            <div class="hero-stat"><div class="hero-stat-number count-up" data-target="50" data-suffix="+">50+</div><div class="hero-stat-label">${t("hero_stat_services")}</div></div>
          </div>
        </div>
      </section>

      <section class="section reveal">
        <div class="section-header">
          <span class="section-emoji">🔱</span>
          <h2 class="section-title">${t("section_popular_pooja_title")}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">${t("section_popular_pooja_subtitle")}</p>
        </div>
        <div class="pooja-grid">${popularPooja.slice(0, 6).map((p, i) => renderPoojaCard(p, i)).join("")}</div>
        <div class="text-center mt-xl"><button class="btn btn-secondary" onclick="navigateTo('pooja')">${t("pooja_view_all")}</button></div>
      </section>

      <section class="section reveal founder-section">
        <div class="section-header">
          <span class="section-emoji">🙏</span>
          <h2 class="section-title">${t("founder_title")}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">${t("founder_subtitle")}</p>
        </div>
        <div class="founder-card reveal-inner" style="--td: 0.1s">
          <div class="founder-img-wrap">
            <img src="images/pandit_photo.jpg" alt="Founder - Maa Bhawani Enterprises" class="founder-img" />
            <div class="founder-img-glow"></div>
          </div>
          <div class="founder-info">
            <h3 class="founder-name">${t("founder_name")}</h3>
            <div class="founder-role">${t("founder_role")}</div>
            <p class="founder-desc">${t("founder_desc")}</p>
            <div class="founder-stats">
              <div class="founder-stat"><span class="founder-stat-num count-up" data-target="15" data-suffix="+">15+</span><span class="founder-stat-label">${t("founder_stat_exp")}</span></div>
              <div class="founder-stat"><span class="founder-stat-num count-up" data-target="50" data-suffix="+">50+</span><span class="founder-stat-label">${t("founder_stat_pooja")}</span></div>
              <div class="founder-stat"><span class="founder-stat-num count-up" data-target="500" data-suffix="+">500+</span><span class="founder-stat-label">${t("founder_stat_families")}</span></div>
            </div>
            <button class="btn btn-primary mt-lg" onclick="openWhatsApp(null, 'consult')">💬 ${t("founder_consult")}</button>
          </div>
        </div>
      </section>

      <section class="section reveal" id="testimonialSection">
        <div class="section-header">
          <span class="section-emoji">💬</span>
          <h2 class="section-title">${t("section_testimonials_title")}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">${t("section_testimonials_subtitle")}</p>
        </div>
        <div class="testimonial-slider" id="testimonialSlider">
          ${renderTestimonialCards()}
        </div>
      </section>
    </div>
  `;
}

function renderTestimonialCards() {
  const visible = TESTIMONIALS.slice(0, visibleTestimonialsCount);
  let html = visible.map(
    (tm, idx) => `
    <div class="testimonial-card reveal-left reveal-inner" style="transition-delay: ${(idx % 3) * 0.15}s; --td: ${(idx % 3) * 0.15}s">
      <div class="testimonial-stars">${"★".repeat(tm.rating)}${"☆".repeat(5 - tm.rating)}</div>
      <p class="testimonial-text">"${localText(tm)}"</p>
      <div class="testimonial-author">
        <span class="testimonial-avatar">${tm.avatar}</span>
        <div>
          <div class="testimonial-name">${tm.name}</div>
          <div class="testimonial-location">📍 ${localLocation(tm)}</div>
        </div>
      </div>
    </div>`
  ).join("");

  html += `<div class="testimonial-actions" style="grid-column: 1 / -1; display: flex; justify-content: center; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">`;
  
  html += `<button class="btn btn-primary" onclick="openReviewModal()">${t("reviews_write")}</button>`;

  if (visibleTestimonialsCount < TESTIMONIALS.length) {
    html += `<button class="btn btn-secondary btn-see-more-reviews" onclick="showMoreTestimonials()">${t("reviews_see_more")}</button>`;
  }
  if (visibleTestimonialsCount > 3) {
    html += `<button class="btn btn-secondary btn-see-less-reviews" onclick="showLessTestimonials()">${t("reviews_see_less")}</button>`;
  }
  
  html += `</div>`;
  return html;
}

function showMoreTestimonials() {
  visibleTestimonialsCount += 3;
  document.getElementById("testimonialSlider").innerHTML = renderTestimonialCards();
  setupScrollReveal();
}

function showLessTestimonials() {
  visibleTestimonialsCount = Math.max(3, visibleTestimonialsCount - 3);
  document.getElementById("testimonialSlider").innerHTML = renderTestimonialCards();
  setupScrollReveal();
}

// ── SHOP ──
function renderShopPage() {
  return `
    <div class="page">
      <section class="section">
        <div class="section-header">
          <span class="section-emoji">🛕</span>
          <h2 class="section-title">${t("shop_title")}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">${t("shop_subtitle")}</p>
        </div>
        <div class="filter-bar">
          <input type="text" class="search-input" id="shopSearch" placeholder="${t("shop_search_placeholder")}" value="${searchQuery}" oninput="handleSearch(this.value)" />
          <div class="filter-tabs" id="filterTabs">
            ${CATEGORIES.map(
              (cat) => `
              <button class="filter-btn ${cat.id === activeCategory ? "active" : ""}" onclick="filterByCategory('${cat.id}')">
                ${cat.emoji} ${currentLang === "hi" && cat.nameHi ? cat.nameHi : cat.name}
              </button>`
            ).join("")}
          </div>
        </div>
        <div class="product-grid" id="productGrid">${renderFilteredProducts()}</div>
      </section>
    </div>
  `;
}

function renderFilteredProducts() {
  let filtered = PRODUCTS;
  if (activeCategory !== "all")
    filtered = filtered.filter((p) => p.category === activeCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.nameHi && p.nameHi.includes(q)) ||
        (p.descHi && p.descHi.includes(q))
    );
  }
  if (filtered.length === 0) {
    return `<div class="cart-empty" style="grid-column:1/-1;"><div class="cart-empty-icon">🔍</div><div class="cart-empty-text">${t("shop_no_results")}</div></div>`;
  }
  return filtered.map((p, i) => renderProductCard(p, i)).join("");
}

function renderProductCard(product, index = 0) {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
  const inCart = cart.some((c) => c.id === product.id && c.type === "product");
  const imgHtml = product.image
    ? `<div class="product-img-wrap">
         <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=product-emoji-fallback>${product.emoji}</div>'" />
         <span class="product-img-emoji">${product.emoji}</span>
       </div>`
    : `<div class="product-emoji">${product.emoji}</div>`;
  return `
    <div class="product-card reveal reveal-inner" style="transition-delay: ${(index % 12) * 0.05}s; --td: ${(index % 12) * 0.05}s" id="product-${product.id}">
      ${discount > 0 ? `<span class="product-badge">${discount}% ${t("product_off")}</span>` : ""}
      ${imgHtml}
      <h3 class="product-name">${localName(product)}</h3>
      <p class="product-desc">${localDesc(product)}</p>
      <div class="product-rating">
        <span class="stars">${renderStars(product.rating)}</span>
        <span class="review-count">(${product.reviews})</span>
      </div>
      <div class="product-footer">
        <div class="product-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.originalPrice > product.price ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>` : ""}
        </div>
        <button class="add-cart-btn ${inCart ? "added" : ""}" onclick="addToCart(${product.id},'product')" id="addBtn-${product.id}">
          ${inCart ? t("product_added") : t("product_add")}
        </button>
      </div>
    </div>
  `;
}

function setupShopListeners() {
  const s = document.getElementById("shopSearch");
  if (s) s.focus();
}
function handleSearch(q) {
  searchQuery = q;
  const g = document.getElementById("productGrid");
  if (g) {
    g.innerHTML = renderFilteredProducts();
    setupScrollReveal();
  }
}
function filterByCategory(id) {
  activeCategory = id;
  document.getElementById("app").innerHTML = renderShopPage();
  setupShopListeners();
}
function goToCategory(id) {
  navigateTo("pooja");
}

// ── POOJA BOOKING ──
function renderPoojaPage() {
  return `
    <div class="page">
      <section class="section">
        <div class="section-header">
          <span class="section-emoji">📿</span>
          <h2 class="section-title">${t("pooja_title")}</h2>
          <div class="divider"></div>
          <p class="section-subtitle">${t("pooja_subtitle")}</p>
        </div>
        <div class="filter-bar">
          <input type="text" class="search-input" id="poojaSearch" placeholder="${t("pooja_search_placeholder")}" value="${poojaSearchQuery}" oninput="handlePoojaSearch(this.value)" />
        </div>
        <div class="pooja-grid" id="poojaGrid">${renderFilteredPoojas()}</div>
      </section>
    </div>
  `;
}

function renderFilteredPoojas() {
  let filtered = POOJA_SERVICES;
  if (poojaSearchQuery) {
    const q = poojaSearchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.nameHi && p.nameHi.includes(q)) ||
        (p.descHi && p.descHi.includes(q))
    );
  }
  if (filtered.length === 0) {
    return `<div class="cart-empty" style="grid-column:1/-1;"><div class="cart-empty-icon">🔍</div><div class="cart-empty-text">${t("pooja_no_results")}</div></div>`;
  }
  return filtered.map((p, i) => renderPoojaCard(p, i)).join("");
}

function handlePoojaSearch(q) {
  poojaSearchQuery = q;
  const g = document.getElementById("poojaGrid");
  if (g) {
    g.innerHTML = renderFilteredPoojas();
    setupScrollReveal();
  }
}

function renderPoojaCard(pooja, index = 0) {
  const imgHtml = pooja.image
    ? `<div class="pooja-img-banner">
         <img src="${pooja.image}" alt="${pooja.name}" loading="lazy" onerror="this.parentElement.style.display='none'" />
         <span class="pooja-img-emoji">${pooja.emoji}</span>
       </div>`
    : "";
  return `
    <div class="pooja-card reveal reveal-inner" style="transition-delay: ${(index % 10) * 0.08}s; --td: ${(index % 10) * 0.08}s">
      ${pooja.popular ? `<span class="pooja-popular">${t("pooja_popular")}</span>` : ""}
      ${imgHtml}
      <div class="pooja-header">
        <span class="pooja-emoji">${pooja.emoji}</span>
        <div class="pooja-info">
          <h3 class="pooja-name">${localName(pooja)}</h3>
          <div class="pooja-meta"><span>⏱️ ${localDuration(pooja)}</span><span>${t("pooja_at_home")}</span></div>
        </div>
      </div>
      <p class="pooja-desc">${localDesc(pooja)}</p>
      <div class="pooja-includes">
        <div class="pooja-includes-title">${t("pooja_includes")}</div>
        <div class="pooja-includes-list">${localIncludes(pooja).map((i) => `<span>✓ ${i}</span>`).join("")}</div>
      </div>
      <div class="pooja-footer">
        <div><span class="pooja-price">${formatPrice(pooja.price)}</span><span class="pooja-price-label">${t("pooja_starting")}</span></div>
        <button class="btn btn-primary" onclick="addToCart(${pooja.id}, 'pooja'); navigateTo('cart');">${getDynamicCalendarIcon()} ${t("pooja_book_now")}</button>
      </div>
    </div>
  `;
}

// ── CART ──
function renderCartPage() {
  if (cart.length === 0) {
    return `
      <div class="page"><div class="cart-container">
        <div class="cart-header"><h2 class="section-title">${t("cart_title")}</h2><div class="divider"></div></div>
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p class="cart-empty-text">${t("cart_empty_text")}</p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="navigateTo('pooja')">${getDynamicCalendarIcon()} ${t("hero_btn_book")}</button>
          </div>
          ${orders.length > 0 ? `<div class="mt-lg"><button class="btn btn-secondary" onclick="navigateTo('orders')">📋 ${t("nav_orders")}</button></div>` : ""}
        </div>
      </div></div>
    `;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 500 ? 0 : 49;
  const total = subtotal + delivery;

  return `
    <div class="page"><div class="cart-container">
      <div class="cart-header">
        <h2 class="section-title">${t("cart_title")}</h2><div class="divider"></div>
        <p class="section-subtitle">${cart.length} ${t("cart_items_in")}</p>
      </div>
      <div class="cart-items">
        ${cart
          .map(
            (item, i) => `
          <div class="cart-item">
            <div class="cart-item-emoji">${item.emoji}</div>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.localName || item.name}</div>
              <div class="cart-item-type">${item.type === "product" ? t("cart_samagri") : t("cart_service")}</div>
            </div>
            ${
              item.type === "product"
                ? `<div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQty(${i},-1)">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${i},1)">+</button>
              </div>`
                : `<div class="cart-item-qty"><span class="qty-value" style="color:var(--text-muted)">${t("cart_service_label")}</span></div>`
            }
            <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
            <button class="cart-item-remove" onclick="removeFromCart(${i})" title="Remove">✕</button>
          </div>`
          )
          .join("")}
      </div>
      <div class="cart-summary">
        <h3 class="cart-summary-title">${t("cart_summary_title")}</h3>
        <div class="cart-summary-row"><span>${t("cart_subtotal")}</span><span>${formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row"><span>${t("cart_delivery")}</span><span>${delivery === 0 ? `<span style="color:#4caf50">${t("cart_free")}</span>` : formatPrice(delivery)}</span></div>
        ${delivery !== 0 ? `<div class="cart-summary-row text-muted" style="font-size:0.8rem"><span>${t("cart_free_note")}</span></div>` : ""}
        <div class="cart-summary-total"><span>${t("cart_total")}</span><span>${formatPrice(total)}</span></div>
        <div class="cart-actions">
          <button class="btn btn-secondary" onclick="navigateTo('pooja')">${t("cart_continue")}</button>
          <button class="btn btn-primary" onclick="openCheckoutModal()">${t("cart_place_order")}</button>
        </div>
      </div>
    </div></div>
  `;
}

// ── ORDERS PAGE ──
function renderOrdersPage() {
  if (orders.length === 0) {
    return `
      <div class="page"><section class="section">
        <div class="section-header">
          <span class="section-emoji">📋</span>
          <h2 class="section-title">${t("orders_title")}</h2><div class="divider"></div>
        </div>
        <div class="cart-empty">
          <div class="cart-empty-icon">📦</div>
          <p class="cart-empty-text">${t("orders_empty")}</p>
          <button class="btn btn-primary" onclick="navigateTo('pooja')">${getDynamicCalendarIcon()} ${t("hero_btn_book")}</button>
        </div>
      </section></div>
    `;
  }

  return `
    <div class="page"><section class="section">
      <div class="section-header">
        <span class="section-emoji">📋</span>
        <h2 class="section-title">${t("orders_title")}</h2><div class="divider"></div>
        <p class="section-subtitle">${orders.length} ${t("orders_count")}</p>
      </div>
      <div class="orders-list">
        ${orders
          .slice()
          .reverse()
          .map(
            (order) => `
          <div class="order-card">
            <div class="order-card-header">
              <div>
                <div class="order-id">${t("order_id_label")}: <strong>${order.orderId}</strong></div>
                <div class="order-date">📅 ${order.date}</div>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-md);">
                <div class="order-status ${order.status}">${order.status === "confirmed" ? t("status_confirmed") : t("status_processing")}</div>
                <button class="order-delete-btn" onclick="deleteOrder('${order.orderId}')" title="Delete Order History" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--text-muted);line-height:1;">&times;</button>
              </div>
            </div>
            <div class="order-items-preview">
              ${order.items
                .map(
                  (item) =>
                    `<span class="order-item-chip">${item.emoji || "🛕"} ${localName(item)} ×${item.qty}</span>`
                )
                .join("")}
            </div>
            <div class="order-card-footer">
              <div class="order-total">${t("cart_total")}: <strong>${formatPrice(order.grandTotal)}</strong></div>
              <div class="order-payment">💳 ${order.paymentType === "upi" || (order.paymentMethod && order.paymentMethod.includes("UPI")) ? t("checkout_upi") : t("checkout_cod")}</div>
              <button class="btn btn-sm btn-secondary" onclick="viewOrderReceipt('${order.orderId}')">📄 ${t("order_view_receipt")}</button>
              <button class="btn btn-sm btn-primary" onclick="askOrderStatus('${order.orderId}')">💬 ${t("order_check_status")}</button>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </section></div>
  `;
}

function viewOrderReceipt(orderId) {
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return;

  const bodyHTML = `
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-brand">🙏 ${BUSINESS.name}</div>
        <div class="receipt-meta">${t("order_id_label")}: <strong>${order.orderId}</strong></div>
        <div class="receipt-meta">📅 ${order.date}</div>
        <div class="receipt-status ${order.status}">${order.status === "confirmed" ? t("status_confirmed") : t("status_processing")}</div>
      </div>
      <div class="receipt-divider"></div>
      <div class="receipt-section">
        <div class="receipt-section-title">👤 ${t("checkout_name")}</div>
        <div>${order.customerName}</div>
        <div>📞 ${order.customerPhone}</div>
        <div>📍 ${order.customerAddress}</div>
      </div>
      <div class="receipt-divider"></div>
      <div class="receipt-section">
        <div class="receipt-section-title">🛒 ${t("checkout_items")}</div>
        ${order.items
          .map(
            (item) => `
          <div class="receipt-item">
            <span>${item.emoji || "🛕"} ${localName(item)} ×${item.qty}</span>
            <span>${formatPrice(item.price * item.qty)}</span>
          </div>`
          )
          .join("")}
      </div>
      <div class="receipt-divider"></div>
      <div class="receipt-item"><span>${t("cart_subtotal")}</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="receipt-item"><span>${t("cart_delivery")}</span><span>${order.delivery === 0 ? t("cart_free") : formatPrice(order.delivery)}</span></div>
      <div class="receipt-item receipt-total"><span>${t("cart_total")}</span><span>${formatPrice(order.grandTotal)}</span></div>
      <div class="receipt-divider"></div>
      <div class="receipt-item"><span>💳 ${t("checkout_payment")}</span><span>${order.paymentType === "upi" || (order.paymentMethod && order.paymentMethod.includes("UPI")) ? t("checkout_upi") : t("checkout_cod")}</span></div>
    </div>
  `;

  const footerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">${t("close")}</button>
    <button class="btn btn-sm btn-primary" onclick="askOrderStatus('${order.orderId}')">💬 ${t("order_check_status")}</button>
    <button class="btn btn-primary" onclick="reorderFromReceipt('${order.orderId}')">🔄 ${t("order_reorder")}</button>
  `;

  openModal(`📄 ${t("order_receipt")} — ${order.orderId}`, bodyHTML, footerHTML);
}

function deleteOrder(orderId) {
  if (confirm(t("order_delete_confirm"))) {
    orders = orders.filter((o) => o.orderId !== orderId);
    localStorage.setItem("poojapath_orders", JSON.stringify(orders));
    
    document.getElementById("app").innerHTML = renderOrdersPage();
    setupScrollReveal();
    showToast(t("order_removed"));
  }
}

function reorderFromReceipt(orderId) {
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return;
  order.items.forEach((item) => {
    const existing = cart.find(
      (c) => c.id === item.id && c.type === item.type
    );
    if (!existing) {
      cart.push({ ...item });
    }
  });
  saveCart();
  updateCartBadge();
  closeModal();
  showToast(t("toast_reorder_added"), "✅");
  navigateTo("cart");
}

// ── ABOUT ──
function renderAboutPage() {
  const features = [
    { emoji: "🏆", titleKey: "about_f1_title", descKey: "about_f1_desc" },
    { emoji: "👳", titleKey: "about_f2_title", descKey: "about_f2_desc" },
    { emoji: "🚚", titleKey: "about_f3_title", descKey: "about_f3_desc" },
    { emoji: "💰", titleKey: "about_f4_title", descKey: "about_f4_desc" },
    { emoji: "🔒", titleKey: "about_f5_title", descKey: "about_f5_desc" },
    { emoji: "📞", titleKey: "about_f6_title", descKey: "about_f6_desc" },
  ];
  return `
    <div class="page">
      <div class="about-hero">
        <div class="about-hero-emoji">🙏</div>
        <h1 class="section-title">${t("about_title")}</h1>
        <div class="divider"></div>
        <p class="about-story mt-lg">${t("about_story")}</p>
      </div>
      <section class="section reveal">
        <div class="section-header"><span class="section-emoji">✨</span><h2 class="section-title">${t("about_why_title")}</h2><div class="divider"></div></div>
        <div class="feature-grid">
          ${features.map((f) => `<div class="feature-card"><div class="feature-emoji">${f.emoji}</div><h3 class="feature-title">${t(f.titleKey)}</h3><p class="feature-desc">${t(f.descKey)}</p></div>`).join("")}
        </div>
      </section>
      <section class="section reveal">
        <div class="section-header"><span class="section-emoji">📊</span><h2 class="section-title">${t("about_journey_title")}</h2><div class="divider"></div></div>
        <div class="hero-stats" style="max-width:800px;margin:0 auto">
          <div class="hero-stat"><div class="hero-stat-number">500+</div><div class="hero-stat-label">${t("about_stat_families")}</div></div>
          <div class="hero-stat"><div class="hero-stat-number">1000+</div><div class="hero-stat-label">${t("about_stat_poojas")}</div></div>
          <div class="hero-stat"><div class="hero-stat-number">50+</div><div class="hero-stat-label">${t("about_stat_pandits")}</div></div>
          <div class="hero-stat"><div class="hero-stat-number">20+</div><div class="hero-stat-label">${t("about_stat_cities")}</div></div>
        </div>
      </section>
    </div>
  `;
}

// ── CONTACT ──
function renderContactPage() {
  return `
    <div class="page">
      <section class="section">
        <div class="section-header">
          <span class="section-emoji">📞</span>
          <h2 class="section-title">${t("contact_title")}</h2><div class="divider"></div>
          <p class="section-subtitle">${t("contact_subtitle")}</p>
        </div>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-info-card" onclick="openWhatsApp('${BUSINESS.whatsappGreeting}')" style="cursor:pointer">
              <div class="contact-icon">💬</div>
              <div>
                <div class="contact-info-title">${t("contact_whatsapp")}</div>
                <div class="contact-info-text">${BUSINESS.displayPhone}</div>
                <div class="contact-info-text" style="color:var(--clr-gold)">${t("contact_tap_chat")}</div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">📞</div>
              <div>
                <div class="contact-info-title">${t("contact_phone")}</div>
                <div class="contact-info-text">${BUSINESS.displayPhone}</div>
                <div class="contact-info-text">${t("contact_hours")}</div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">✉️</div>
              <div>
                <div class="contact-info-title">${t("contact_email_title")}</div>
                <div class="contact-info-text">${BUSINESS.email}</div>
                <div class="contact-info-text">${t("contact_reply_time")}</div>
              </div>
            </div>
            <div class="contact-info-card">
              <div class="contact-icon">📍</div>
              <div>
                <div class="contact-info-title">${t("contact_address_title")}</div>
                <div class="contact-info-text">${BUSINESS.address}</div>
              </div>
            </div>
          </div>

          <div class="contact-form-card">
            <h3 class="contact-form-title">${t("contact_form_title")}</h3>
            <form onsubmit="handleContactSubmit(event)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="contactName">${t("contact_name")}</label>
                  <input class="form-input" type="text" id="contactName" required placeholder="${t("contact_name_placeholder")}" />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contactPhone">${t("contact_phone_label")}</label>
                  <input class="form-input" type="tel" id="contactPhone" required placeholder="${t("contact_phone_placeholder")}" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="contactEmail">${t("contact_email_label")}</label>
                <input class="form-input" type="email" id="contactEmail" placeholder="${t("contact_email_placeholder")}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="contactSubject">${t("contact_subject")}</label>
                <select class="form-select" id="contactSubject">
                  <option value="">${t("contact_select_topic")}</option>
                  <option value="order">${t("contact_topic_order")}</option>
                  <option value="booking">${t("contact_topic_booking")}</option>
                  <option value="custom">${t("contact_topic_custom")}</option>
                  <option value="complaint">${t("contact_topic_complaint")}</option>
                  <option value="other">${t("contact_topic_other")}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="contactMessage">${t("contact_message")}</label>
                <textarea class="form-textarea" id="contactMessage" required placeholder="${t("contact_msg_placeholder")}"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">${t("contact_send")}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  `;
}

// ══════════════════════════════════════
// ── CART MANAGEMENT
// ══════════════════════════════════════

function addToCart(id, type) {
  let item;
  if (type === "product") {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const existing = cart.find((c) => c.id === id && c.type === "product");
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        localName: localName(product),
        price: product.price,
        emoji: product.emoji,
        type: "product",
        qty: 1,
      });
    }
    item = product;
  } else if (type === "pooja") {
    const pooja = POOJA_SERVICES.find((p) => p.id === id);
    if (!pooja) return;
    const existing = cart.find((c) => c.id === id && c.type === "pooja");
    if (existing) {
      showToast(t("toast_already_in_cart"), "⚠️");
      return;
    }
    cart.push({
      id: pooja.id,
      name: pooja.name,
      localName: localName(pooja),
      price: pooja.price,
      emoji: pooja.emoji,
      type: "pooja",
      qty: 1,
    });
    item = pooja;
  }
  saveCart();
  updateCartBadge();
  showToast(`${localName(item)} ${t("toast_added")}`, "✅");
  const btn = document.getElementById(`addBtn-${id}`);
  if (btn) {
    btn.classList.add("added");
    btn.innerHTML = t("product_added");
  }
}

function removeFromCart(i) {
  const removed = cart.splice(i, 1)[0];
  saveCart();
  updateCartBadge();
  showToast(`${removed.localName || removed.name} ${t("toast_removed")}`, "🗑️");
  if (currentPage === "cart") document.getElementById("app").innerHTML = renderCartPage();
}

function updateQty(i, delta) {
  const item = cart[i];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(i);
    return;
  }
  saveCart();
  if (currentPage === "cart") document.getElementById("app").innerHTML = renderCartPage();
}

function saveCart() {
  localStorage.setItem("poojapath_cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const total = cart.reduce((s, i) => s + i.qty, 0);
  if (total > 0) {
    badge.textContent = total;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// ══════════════════════════════════════
// ── MODALS
// ══════════════════════════════════════

function openModal(title, bodyHTML, footerHTML = "") {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  document.getElementById("modalFooter").innerHTML = footerHTML;
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

// ── Booking Modal (sends WhatsApp) ──
function openBookingModal(poojaId) {
  const pooja = POOJA_SERVICES.find((p) => p.id === poojaId);
  if (!pooja) return;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const bodyHTML = `
    <div style="margin-bottom:var(--space-lg);display:flex;align-items:center;gap:var(--space-md);padding:var(--space-md);background:var(--bg-glass);border-radius:var(--radius-md);">
      <span style="font-size:2.5rem">${pooja.emoji}</span>
      <div>
        <div style="font-weight:600;font-size:1.1rem">${localName(pooja)}</div>
        <div style="color:var(--text-muted);font-size:0.85rem">⏱️ ${localDuration(pooja)} • ${formatPrice(pooja.price)}</div>
      </div>
    </div>
    <form id="bookingForm" onsubmit="submitBooking(event,${pooja.id})">
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="bookName">${t("booking_name")}</label><input class="form-input" type="text" id="bookName" required placeholder="${t("contact_name_placeholder")}" /></div>
        <div class="form-group"><label class="form-label" for="bookPhone">${t("booking_phone")}</label><input class="form-input" type="tel" id="bookPhone" required placeholder="${t("contact_phone_placeholder")}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="bookDate">${t("booking_date")}</label><input class="form-input" type="date" id="bookDate" required min="${minDate}" /></div>
        <div class="form-group"><label class="form-label" for="bookTime">${t("booking_time")}</label>
          <select class="form-select" id="bookTime" required>
            <option value="">${t("booking_select_time")}</option>
            <option value="06:00">${t("time_0600")}</option><option value="07:00">${t("time_0700")}</option>
            <option value="08:00">${t("time_0800")}</option><option value="09:00">${t("time_0900")}</option>
            <option value="10:00">${t("time_1000")}</option><option value="11:00">${t("time_1100")}</option>
            <option value="16:00">${t("time_1600")}</option><option value="17:00">${t("time_1700")}</option>
            <option value="18:00">${t("time_1800")}</option><option value="19:00">${t("time_1900")}</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label" for="bookAddress">${t("booking_address")}</label><div class="loc-input-wrap"><textarea class="form-textarea" id="bookAddress" required placeholder="${t("booking_address_placeholder")}" style="min-height:80px"></textarea><button type="button" class="btn btn-sm loc-btn" id="bookAddressLocBtn" onclick="detectLocation('bookAddress')">📍 ${t("loc_detect")}</button></div></div>
      <div class="form-group"><label class="form-label" for="bookNotes">${t("booking_notes")}</label><textarea class="form-textarea" id="bookNotes" placeholder="${t("booking_notes_placeholder")}" style="min-height:60px"></textarea></div>
    </form>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">${t("booking_cancel")}</button>
    <button class="btn btn-primary" onclick="document.getElementById('bookingForm').requestSubmit()">${t("booking_confirm")}</button>
  `;
  openModal(`${t("booking_book")} ${localName(pooja)}`, bodyHTML, footerHTML);
}

function submitBooking(event, poojaId) {
  event.preventDefault();
  const pooja = POOJA_SERVICES.find((p) => p.id === poojaId);
  const bookingId = generateOrderId();
  const timeEl = document.getElementById("bookTime");
  const timeText = timeEl && timeEl.selectedIndex >= 0 ? timeEl.options[timeEl.selectedIndex].text : document.getElementById("bookTime").value;

  const bookingData = {
    bookingId,
    poojaName: localName(pooja),
    price: pooja.price,
    customerName: document.getElementById("bookName").value,
    customerPhone: document.getElementById("bookPhone").value,
    date: document.getElementById("bookDate").value,
    time: timeText,
    address: document.getElementById("bookAddress").value,
    notes: document.getElementById("bookNotes").value,
  };

  addToCart(poojaId, "pooja");

  // Send to WhatsApp
  const waMsg = buildWhatsAppBookingMsg(bookingData);

  document.getElementById("modalBody").innerHTML = `
    <div class="success-animation">
      <div class="success-checkmark">✅</div>
      <div class="success-text">${t("booking_success_title")}</div>
      <div class="success-subtext">
        ${t("order_id_label")}: <strong>${bookingId}</strong><br>
        ${localName(pooja)} ${t("booking_success_added")}<br>
        ${t("booking_success_call")}
      </div>
      <div class="mt-lg" style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openWhatsApp('${waMsg}')">💬 ${t("booking_send_wa")}</button>
        <button class="btn btn-secondary" onclick="closeModal();navigateTo('cart');">${t("booking_go_cart")}</button>
      </div>
    </div>
  `;
  document.getElementById("modalFooter").innerHTML = "";

  // Auto-send booking details to owner WhatsApp
  setTimeout(() => openWhatsApp(waMsg), 600);
}

// ══════════════════════════════════════
// ── CHECKOUT (Multi-step with UPI QR)
// ══════════════════════════════════════

let checkoutData = {};

function openCheckoutModal() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 500 ? 0 : 49;
  const grandTotal = subtotal + delivery;

  checkoutData = { subtotal, delivery, grandTotal };

  const bodyHTML = `
    <div class="checkout-steps">
      <div class="step-indicator">
        <div class="step active" id="step1Ind"><span>1</span>${t("checkout_step_details")}</div>
        <div class="step-line"></div>
        <div class="step" id="step2Ind"><span>2</span>${t("checkout_step_payment")}</div>
        <div class="step-line"></div>
        <div class="step" id="step3Ind"><span>3</span>${t("checkout_step_confirm")}</div>
      </div>
    </div>
    <form id="checkoutForm" onsubmit="goToPaymentStep(event)">
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="checkName">${t("checkout_name")}</label><input class="form-input" type="text" id="checkName" required placeholder="${t("contact_name_placeholder")}" /></div>
        <div class="form-group"><label class="form-label" for="checkPhone">${t("checkout_phone")}</label><input class="form-input" type="tel" id="checkPhone" required placeholder="${t("contact_phone_placeholder")}" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label" for="checkDate">${t("booking_date")}</label><input class="form-input" type="date" id="checkDate" required /></div>
        <div class="form-group"><label class="form-label" for="checkTime">${t("booking_time")}</label>
          <select class="form-select" id="checkTime" required>
            <option value="">${t("booking_select_time")}</option>
            <option value="Morning (प्रातःकाल)">Morning (प्रातःकाल)</option>
            <option value="Afternoon (मध्याह्न)">Afternoon (मध्याह्न)</option>
            <option value="Evening (सायंकाल)">Evening (सायंकाल)</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label class="form-label" for="checkEmail">${t("checkout_email")}</label><input class="form-input" type="email" id="checkEmail" placeholder="${t("contact_email_placeholder")}" /></div>
      <div class="form-group"><label class="form-label" for="checkAddress">${t("checkout_address")}</label><div class="loc-input-wrap"><textarea class="form-textarea" id="checkAddress" required placeholder="${t("booking_address_placeholder")}" style="min-height:80px"></textarea><button type="button" class="btn btn-sm loc-btn" id="checkAddressLocBtn" onclick="detectLocation('checkAddress')">📍 ${t("loc_detect")}</button></div></div>
      <div style="padding:var(--space-md);background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-gold)">
        <div class="cart-summary-row"><span>${t("checkout_items")} (${cart.reduce((s, i) => s + i.qty, 0)})</span><span>${formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row"><span>${t("cart_delivery")}</span><span>${delivery === 0 ? t("cart_free") : formatPrice(delivery)}</span></div>
        <div class="cart-summary-total" style="font-size:1.1rem"><span>${t("cart_total")}</span><span>${formatPrice(grandTotal)}</span></div>
      </div>
    </form>
  `;
  const footerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">${t("checkout_cancel")}</button>
    <button class="btn btn-primary" onclick="document.getElementById('checkoutForm').requestSubmit()">${t("checkout_next")} →</button>
  `;
  openModal(t("checkout_title"), bodyHTML, footerHTML);
}

function goToPaymentStep(event) {
  event.preventDefault();
  checkoutData.customerName = document.getElementById("checkName").value;
  checkoutData.customerPhone = document.getElementById("checkPhone").value;
  checkoutData.customerEmail = document.getElementById("checkEmail").value;
  checkoutData.customerAddress = document.getElementById("checkAddress").value;
  
  if (document.getElementById("checkDate")) {
    checkoutData.date = document.getElementById("checkDate").value;
    checkoutData.time = document.getElementById("checkTime").value;
  }

  // Update step indicators
  const s1 = document.getElementById("step1Ind");
  const s2 = document.getElementById("step2Ind");
  if (s1) s1.classList.replace("active", "done");
  if (s2) s2.classList.add("active");

  const orderId = generateOrderId();
  checkoutData.orderId = orderId;
  const qrUrl = getUpiQrUrl(checkoutData.grandTotal, orderId);

  document.getElementById("modalBody").innerHTML = `
    <div class="checkout-steps">
      <div class="step-indicator">
        <div class="step done" id="step1Ind"><span>✓</span>${t("checkout_step_details")}</div>
        <div class="step-line done"></div>
        <div class="step active" id="step2Ind"><span>2</span>${t("checkout_step_payment")}</div>
        <div class="step-line"></div>
        <div class="step" id="step3Ind"><span>3</span>${t("checkout_step_confirm")}</div>
      </div>
    </div>
    <div class="payment-options">
      <h3 style="margin-bottom:var(--space-md);font-size:1rem;color:var(--text-secondary)">${t("checkout_select_payment")}</h3>
      
      <div class="payment-option" id="payOptUpi" onclick="selectPayment('upi')">
        <div class="payment-option-header">
          <span class="payment-radio"></span>
          <span class="payment-icon">📱</span>
          <div>
            <div class="payment-name">${t("checkout_upi")}</div>
            <div class="payment-desc">${t("checkout_upi_desc")}</div>
          </div>
        </div>
        <div class="payment-body" id="upiBody">
          <div class="upi-qr-section">
            <img src="${qrUrl}" alt="UPI QR Code" class="upi-qr-img" />
            <div class="upi-info">
              <div class="upi-amount">${formatPrice(checkoutData.grandTotal)}</div>
              <div class="upi-id">${t("checkout_pay_to")}: <strong>${BUSINESS.upiId}</strong></div>
              <div class="upi-order-id">${t("order_id_label")}: <strong>${orderId}</strong></div>
              <div class="upi-steps">
                <div>1️⃣ ${t("checkout_upi_step1")}</div>
                <div>2️⃣ ${t("checkout_upi_step2")}</div>
                <div>3️⃣ ${t("checkout_upi_step3")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="payment-option" id="payOptCod" onclick="selectPayment('cod')">
        <div class="payment-option-header">
          <span class="payment-radio"></span>
          <span class="payment-icon">💵</span>
          <div>
            <div class="payment-name">${t("checkout_cod")}</div>
            <div class="payment-desc">${t("checkout_cod_desc")}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("modalFooter").innerHTML = `
    <button class="btn btn-secondary" onclick="openCheckoutModal()">← ${t("checkout_back")}</button>
    <button class="btn btn-primary" id="confirmPayBtn" onclick="confirmPayment()" disabled>${t("checkout_confirm_pay")}</button>
  `;
}

let selectedPayment = "";

function selectPayment(method) {
  selectedPayment = method;
  document.querySelectorAll(".payment-option").forEach((el) => {
    el.classList.remove("selected");
  });
  const opt = document.getElementById(
    method === "upi" ? "payOptUpi" : "payOptCod"
  );
  if (opt) opt.classList.add("selected");
  const btn = document.getElementById("confirmPayBtn");
  if (btn) btn.disabled = false;
}

function confirmPayment() {
  if (!selectedPayment) return;

  checkoutData.paymentMethod =
    selectedPayment === "upi" ? t("checkout_upi") : t("checkout_cod");
  checkoutData.paymentStatus =
    selectedPayment === "upi" ? t("payment_pending_verify") : t("payment_cod");

  const isHi = currentLang === "hi";
  const now = new Date();
  const dateStr = now.toLocaleDateString(isHi ? "hi-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderData = {
    orderId: checkoutData.orderId,
    date: dateStr,
    customerName: checkoutData.customerName,
    customerPhone: checkoutData.customerPhone,
    customerEmail: checkoutData.customerEmail,
    customerAddress: checkoutData.customerAddress,
    items: cart.map((item) => ({
      ...item,
      nameHi: item.nameHi || (PRODUCTS.find(p => p.id === item.id) || POOJA_SERVICES.find(s => s.id === item.id) || {}).nameHi || item.name,
      localName: localName(item),
    })),
    subtotal: checkoutData.subtotal,
    delivery: checkoutData.delivery,
    grandTotal: checkoutData.grandTotal,
    paymentType: selectedPayment,
    paymentMethod: checkoutData.paymentMethod,
    paymentStatus: checkoutData.paymentStatus,
    status: selectedPayment === "upi" ? "processing" : "confirmed",
    statusLabel:
      selectedPayment === "upi" ? t("status_processing") : t("status_confirmed"),
  };

  // Save to orders
  orders.push(orderData);
  localStorage.setItem("poojapath_orders", JSON.stringify(orders));

  // Build WhatsApp message
  const waMsg = buildWhatsAppOrderMsg(orderData);

  // Clear cart
  cart = [];
  saveCart();
  updateCartBadge();

  // Step 3 — Success
  document.getElementById("modalBody").innerHTML = `
    <div class="checkout-steps">
      <div class="step-indicator">
        <div class="step done"><span>✓</span>${t("checkout_step_details")}</div>
        <div class="step-line done"></div>
        <div class="step done"><span>✓</span>${t("checkout_step_payment")}</div>
        <div class="step-line done"></div>
        <div class="step active"><span>✓</span>${t("checkout_step_confirm")}</div>
      </div>
    </div>
    <div class="success-animation">
      <div class="success-checkmark">🎉</div>
      <div class="success-text">${t("order_text")}</div>
      <div class="order-receipt-mini">
        <div class="receipt-item"><span>${t("order_id_label")}</span><span><strong>${orderData.orderId}</strong></span></div>
        <div class="receipt-item"><span>${t("cart_total")}</span><span><strong>${formatPrice(orderData.grandTotal)}</strong></span></div>
        <div class="receipt-item"><span>💳 ${t("checkout_payment")}</span><span>${orderData.paymentMethod}</span></div>
      </div>
      <div class="success-subtext mt-md">
        ${t("order_thanks")}<br>
        ${t("order_wa_confirm")}
      </div>
      <div class="mt-lg" style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openWhatsApp('${waMsg}')">💬 ${t("order_send_wa")}</button>
        <button class="btn btn-secondary" onclick="closeModal();navigateTo('orders');">📋 ${t("nav_orders")}</button>
      </div>
    </div>
  `;
  document.getElementById("modalFooter").innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal();navigateTo('home');">🙏 ${t("order_back")}</button>
  `;

  // Auto-send order details to owner WhatsApp
  setTimeout(() => openWhatsApp(waMsg), 600);

  // Re-render cart page if open
  if (currentPage === "cart") document.getElementById("app").innerHTML = renderCartPage();
}

// ── Contact Form (sends WhatsApp) ──
function handleContactSubmit(event) {
  event.preventDefault();

  const subEl = document.getElementById("contactSubject");
  let subjectText = "";
  if (subEl && subEl.selectedIndex >= 0) {
    subjectText = subEl.options[subEl.selectedIndex].text;
  }
  const contactData = {
    name: document.getElementById("contactName").value,
    phone: document.getElementById("contactPhone").value,
    email: document.getElementById("contactEmail").value,
    subject: subjectText || (currentLang === "hi" ? "सामान्य पूछताछ" : "General Inquiry"),
    message: document.getElementById("contactMessage").value,
  };

  const waMsg = buildWhatsAppContactMsg(contactData);

  openModal(
    t("contact_success_title"),
    `
    <div class="success-animation">
      <div class="success-checkmark">✅</div>
      <div class="success-text">${t("contact_success_text")}</div>
      <div class="success-subtext">
        ${t("contact_success_reply")}<br>
        ${t("contact_wa_instant")}
      </div>
      <div class="mt-lg" style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="openWhatsApp('${waMsg}')">💬 ${t("contact_send_wa")}</button>
      </div>
    </div>
  `,
    `<button class="btn btn-secondary" onclick="closeModal()">${t("close")}</button>`
  );

  event.target.reset();

  // Auto-send contact message to owner WhatsApp
  setTimeout(() => openWhatsApp(waMsg), 600);
}

// ══════════════════════════════════════
// ── TOAST
// ══════════════════════════════════════

let toastTimeout;
function showToast(message, icon = "✅") {
  const toast = document.getElementById("toast");
  document.getElementById("toastIcon").textContent = icon;
  document.getElementById("toastText").textContent = message;
  clearTimeout(toastTimeout);
  toast.classList.add("show");
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
}

// ── Escape to close ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
