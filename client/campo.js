document.addEventListener("DOMContentLoaded", () => {
  const API = "/api";
  const token = localStorage.getItem("token");

  const tabs = document.querySelectorAll(".action-tab");
  const panels = document.querySelectorAll(".panel");
  const activityList = document.getElementById("actividadLista");
  const pesajesHoy = document.getElementById("pesajesHoy");

  let contadorPesajes = Number(pesajesHoy.textContent || 0);
  let locationsMap = new Map();

  function activarTab(tabId) {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === tabId);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activarTab(tab.dataset.tab));
  });

  function horaActual() {
    const now = new Date();
    return now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function agregarActividad(titulo, detalle) {
    const emptyItem = activityList.querySelector(".activity-item");

    if (emptyItem && emptyItem.textContent.includes("Sin registros todavía")) {
      activityList.innerHTML = "";
    }

    const item = document.createElement("article");
    item.className = "activity-item";
    item.innerHTML = `
      <strong>${titulo}</strong>
      <span>${detalle} · ${horaActual()}</span>
    `;

    activityList.prepend(item);
  }

  function limpiarCampos(ids) {
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      if (el.tagName === "SELECT") {
        el.selectedIndex = 0;
      } else {
        el.value = "";
      }
    });
  }

  async function api(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = "Error en la solicitud";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return res.json();
  }

  async function cargarUbicaciones() {
    if (!token) return;

    try {
      const locations = await api("/locations");
      locationsMap = new Map(locations.map((l) => [String(l.id), l.name]));

      const origen = document.getElementById("origen");
      const destino = document.getElementById("destino");

      origen.innerHTML =
        `<option value="">Automático según ubicación actual</option>` +
        locations.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");

      destino.innerHTML =
        `<option value="">Selecciona destino</option>` +
        locations.map((l) => `<option value="${l.id}">${l.name}</option>`).join("");
    } catch (error) {
      alert("No pude cargar las ubicaciones. Revisa si sigues logueado.");
    }
  }

  const guardarBascula = document.getElementById("guardarBascula");
  if (guardarBascula) {
    guardarBascula.addEventListener("click", async () => {
      if (!token) {
        alert("Primero inicia sesión en la app principal.");
        return;
      }

      const chapeta = document.getElementById("chapeta").value.trim();
      const peso = document.getElementById("peso").value.trim();
      const origen = document.getElementById("origen").value.trim();
      const destino = document.getElementById("destino").value.trim();
      const nota = document.getElementById("notaBascula").value.trim();

      if (!chapeta || !peso || !destino) {
        alert("Falta chapeta, peso o destino.");
        return;
      }

      try {
        await api("/campo/bascula", {
          method: "POST",
          body: JSON.stringify({
            animal_code: chapeta,
            weight_kg: Number(peso),
            from_location_id: origen ? Number(origen) : null,
            to_location_id: Number(destino),
            weighed_at: new Date().toISOString().slice(0, 10),
            notes: nota || null,
          }),
        });

        const origenNombre = origen ? (locationsMap.get(origen) || "Sin origen") : "Automático";
        const destinoNombre = locationsMap.get(destino) || "Destino";

        agregarActividad(
          `Báscula · Chapeta ${chapeta}`,
          `${peso} kg · ${origenNombre} → ${destinoNombre}${nota ? ` · ${nota}` : ""}`
        );

        contadorPesajes += 1;
        pesajesHoy.textContent = contadorPesajes;

        limpiarCampos(["chapeta", "peso", "origen", "destino", "notaBascula"]);
        alert("Registro de báscula guardado en la base.");
      } catch (error) {
        alert(error.message);
      }
    });
  }

  activarTab("bascula");
  cargarUbicaciones();
});