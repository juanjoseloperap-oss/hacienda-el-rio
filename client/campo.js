document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".action-tab");
  const panels = document.querySelectorAll(".panel");
  const activityList = document.getElementById("actividadLista");
  const pesajesHoy = document.getElementById("pesajesHoy");

  let contadorPesajes = 0;

  function activarTab(tabId) {
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === tabId);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activarTab(tab.dataset.tab);
    });
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

  const guardarBascula = document.getElementById("guardarBascula");
  if (guardarBascula) {
    guardarBascula.addEventListener("click", () => {
      const chapeta = document.getElementById("chapeta").value.trim();
      const peso = document.getElementById("peso").value.trim();
      const origen = document.getElementById("origen").value.trim();
      const destino = document.getElementById("destino").value.trim();
      const nota = document.getElementById("notaBascula").value.trim();

      if (!chapeta || !peso || !destino) {
        alert("Falta chapeta, peso o destino.");
        return;
      }

      agregarActividad(
        `Báscula · Chapeta ${chapeta}`,
        `${peso} kg · ${origen || "Sin origen"} → ${destino}${nota ? ` · ${nota}` : ""}`
      );

      contadorPesajes += 1;
      pesajesHoy.textContent = contadorPesajes;

      limpiarCampos(["chapeta", "peso", "origen", "destino", "notaBascula"]);
      alert("Registro de báscula guardado.");
    });
  }

  const guardarSanidad = document.getElementById("guardarSanidad");
  if (guardarSanidad) {
    guardarSanidad.addEventListener("click", () => {
      const evento = document.getElementById("eventoSanidad").value.trim();
      const producto = document.getElementById("productoSanidad").value.trim();
      const dosis = document.getElementById("dosisSanidad").value.trim();
      const zona = document.getElementById("zonaSanidad").value.trim();
      const cantidad = document.getElementById("cantidadSanidad").value.trim();
      const nota = document.getElementById("notaSanidad").value.trim();

      if (!evento || !zona || !cantidad) {
        alert("Falta evento, zona o cantidad de animales.");
        return;
      }

      agregarActividad(
        `Sanidad · ${evento}`,
        `${cantidad} animales · ${zona}${producto ? ` · ${producto}` : ""}${dosis ? ` · ${dosis}` : ""}${nota ? ` · ${nota}` : ""}`
      );

      limpiarCampos([
        "eventoSanidad",
        "productoSanidad",
        "dosisSanidad",
        "zonaSanidad",
        "cantidadSanidad",
        "notaSanidad",
      ]);

      alert("Jornada sanitaria guardada.");
    });
  }

  const guardarMovimiento = document.getElementById("guardarMovimiento");
  if (guardarMovimiento) {
    guardarMovimiento.addEventListener("click", () => {
      const desde = document.getElementById("desdePotrero").value.trim();
      const hacia = document.getElementById("haciaPotrero").value.trim();
      const cantidad = document.getElementById("cantidadMovimiento").value.trim();
      const nota = document.getElementById("notaMovimiento").value.trim();

      if (!desde || !hacia || !cantidad) {
        alert("Falta origen, destino o cantidad.");
        return;
      }

      agregarActividad(
        "Movimiento de lote",
        `${cantidad} animales · ${desde} → ${hacia}${nota ? ` · ${nota}` : ""}`
      );

      limpiarCampos([
        "desdePotrero",
        "haciaPotrero",
        "cantidadMovimiento",
        "notaMovimiento",
      ]);

      alert("Movimiento guardado.");
    });
  }

  const guardarInsumo = document.getElementById("guardarInsumo");
  if (guardarInsumo) {
    guardarInsumo.addEventListener("click", () => {
      const tipo = document.getElementById("tipoInsumo").value.trim();
      const nombre = document.getElementById("nombreInsumo").value.trim();
      const cantidad = document.getElementById("cantidadInsumo").value.trim();
      const unidad = document.getElementById("unidadInsumo").value.trim();
      const valor = document.getElementById("valorInsumo").value.trim();
      const nota = document.getElementById("notaInsumo").value.trim();

      if (!tipo || !nombre || !cantidad || !valor) {
        alert("Falta tipo, insumo, cantidad o valor.");
        return;
      }

      agregarActividad(
        `Insumos · ${tipo}`,
        `${nombre} · ${cantidad} ${unidad || ""} · $${valor}${nota ? ` · ${nota}` : ""}`
      );

      limpiarCampos([
        "tipoInsumo",
        "nombreInsumo",
        "cantidadInsumo",
        "unidadInsumo",
        "valorInsumo",
        "notaInsumo",
      ]);

      alert("Registro de insumo guardado.");
    });
  }

  activarTab("bascula");
});