const API_PREFIX = window.__PIXMEMO_API_PREFIX__ ?? "/api";
const photographerList = document.getElementById("photographerList");
const detailContainer = document.getElementById("photographerDetail");
const cityFilter = document.getElementById("cityFilter");

const state = {
  photographers: [],
  filtered: [],
  activeId: null,
  availability: {},
};

async function fetchJSON(endpoint, options = {}) {
  const response = await fetch(`${API_PREFIX}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadPhotographers() {
  try {
    const data = await fetchJSON("/photographers");
    state.photographers = data;
    state.filtered = data;
    renderList();
  } catch (error) {
    photographerList.innerHTML = `<li class="alert error">Nie udało się załadować listy. ${error.message}</li>`;
  }
}

function renderList() {
  if (!state.filtered.length) {
    photographerList.innerHTML = `<li class="alert">Brak fotografów w tym mieście. Spróbuj rozszerzyć filtr.</li>`;
    return;
  }

  photographerList.innerHTML = "";
  state.filtered.forEach((photographer) => {
    const item = document.createElement("li");
    item.className = "photographer-card";
    item.tabIndex = 0;
    item.dataset.id = photographer.id;
    item.innerHTML = `
      <img src="${photographer.heroImage}" alt="${photographer.fullName}" />
      <div class="photographer-meta">
        <strong>${photographer.fullName}</strong>
        <span class="badge">${photographer.city}</span>
        <span>Ocena ${photographer.rating.toFixed(1)} (${photographer.reviewCount})</span>
        <div class="specialties">
          ${photographer.specialties.map((item) => `<span>${item}</span>`).join("")}
        </div>
      </div>
    `;
    item.addEventListener("click", () => selectPhotographer(photographer.id));
    item.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        selectPhotographer(photographer.id);
      }
    });
    photographerList.appendChild(item);
  });
}

function renderAvailability(availability, selectedDate, selectedTime) {
  if (!availability) {
    return "<p>Brak danych o dostępności.</p>";
  }

  const entries = Object.entries(availability);
  if (!entries.length) {
    return "<p>Fotograf nie udostępnił terminów.</p>";
  }

  return `
    <div class="availability-grid">
      ${entries
        .map(([date, slots]) => `
          <div class="availability-day">
            <h4>${date}</h4>
            <div class="slot-list">
              ${slots
                .map(
                  (slot) => `
                    <button type="button" data-date="${date}" data-time="${slot}" ${
                      selectedDate === date && selectedTime === slot ? "data-selected=\"true\"" : ""
                    }>
                      ${slot}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        `)
        .join("")}
    </div>
  `;
}

async function selectPhotographer(id) {
  state.activeId = id;
  detailContainer.innerHTML = `<p>Ładowanie profilu...</p>`;
  try {
    const [profile, availability] = await Promise.all([
      fetchJSON(`/photographers/${id}`),
      fetchJSON(`/photographers/${id}/availability`),
    ]);
    state.availability[id] = availability;
    renderDetail(profile, availability);
  } catch (error) {
    detailContainer.innerHTML = `<div class="alert error">Nie udało się pobrać profilu. ${error.message}</div>`;
  }
}

function renderDetail(profile, availability) {
  const defaultPackage = profile.packages[0];
  detailContainer.className = "detail-card";
  detailContainer.innerHTML = `
    <div class="detail-hero">
      <img src="${profile.heroImage}" alt="${profile.fullName}" />
      <div class="info">
        <h2>${profile.fullName}</h2>
        <p>${profile.city} • Ocena ${profile.rating.toFixed(1)} (${profile.reviewCount})</p>
      </div>
    </div>
    <section>
      <h3>Opis</h3>
      <p>${profile.bio}</p>
      <div class="specialties">
        ${profile.specialties.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </section>
    <section>
      <h3>Pakiety</h3>
      <div class="packages">
        ${profile.packages
          .map(
            (pkg) => `
              <article class="package-card">
                <h3>${pkg.name}</h3>
                <p>${pkg.description}</p>
                <strong>${pkg.pricePln} PLN</strong>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section>
      <h3>Terminy</h3>
      ${renderAvailability(availability)}
    </section>
    <section>
      <h3>Zarezerwuj termin</h3>
      <form class="booking-form" id="bookingForm">
        <div id="formMessage" aria-live="polite"></div>
        <label>
          Adres e-mail
          <input type="email" name="clientEmail" required placeholder="jan.kowalski@example.com" />
        </label>
        <label>
          Wybierz pakiet
          <select name="packageId">
            ${profile.packages
              .map(
                (pkg) => `
                  <option value="${pkg.id}" ${pkg.id === defaultPackage.id ? "selected" : ""}>
                    ${pkg.name} — ${pkg.pricePln} PLN
                  </option>
                `
              )
              .join("")}
          </select>
        </label>
        <label>
          Data
          <input type="date" name="date" required />
        </label>
        <label>
          Godzina
          <input type="time" name="time" required />
        </label>
        <label>
          Ulica i numer
          <input type="text" name="addressStreet" required />
        </label>
        <label>
          Kod pocztowy
          <input type="text" name="addressPostal" required placeholder="87-100" />
        </label>
        <label>
          Miasto
          <input type="text" name="addressCity" required />
        </label>
        <label>
          Uwagi dla fotografa
          <textarea name="travelNotes" rows="3" placeholder="np. Prosimy o kadry w złotej godzinie"></textarea>
        </label>
        <label>
          Preferowana płatność
          <select name="paymentMethod">
            <option value="stripe">Karta/Apple Pay (Stripe)</option>
            <option value="p24">BLIK/Przelew (Przelewy24)</option>
          </select>
        </label>
        <button type="submit">Wyślij rezerwację</button>
      </form>
    </section>
    <section>
      <h3>Opinie klientów</h3>
      <div class="packages">
        ${profile.testimonials
          .map(
            (testimonial) => `
              <article class="package-card">
                <strong>${testimonial.author}</strong>
                <p>Ocena: ${"★".repeat(testimonial.rating)}</p>
                <p>${testimonial.quote}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;

  const form = document.getElementById("bookingForm");
  const messageBox = document.getElementById("formMessage");
  const slotButtons = detailContainer.querySelectorAll(".slot-list button");

  slotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const { date, time } = button.dataset;
      form.elements.date.value = date;
      form.elements.time.value = time;
      slotButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.photographerId = profile.id;

    messageBox.textContent = "Wysyłanie rezerwacji...";
    messageBox.className = "alert";

    try {
      const booking = await fetchJSON("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      messageBox.textContent = `Rezerwacja przyjęta! Identyfikator: ${booking.id}`;
      form.reset();
    } catch (error) {
      messageBox.textContent = error.message;
      messageBox.className = "alert error";
    }
  });
}

cityFilter.addEventListener("input", (event) => {
  const value = event.target.value.trim().toLowerCase();
  if (!value) {
    state.filtered = [...state.photographers];
  } else {
    state.filtered = state.photographers.filter((photographer) =>
      photographer.city.toLowerCase().includes(value)
    );
  }
  renderList();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((error) => console.error("Service worker error", error));
  });
}

loadPhotographers();
