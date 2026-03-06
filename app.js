const STORAGE_KEY = "ritmo.tasks.v1";
const DEFAULT_COLOR = "azul";
const COLOR_TAGS = [
  { id: "azul", name: "Azul", hex: "#2f6df5" },
  { id: "celeste", name: "Celeste", hex: "#22b8cf" },
  { id: "verde", name: "Verde", hex: "#1fb574" },
  { id: "lima", name: "Lima", hex: "#7cb518" },
  { id: "amarillo", name: "Amarillo", hex: "#df9f1d" },
  { id: "naranja", name: "Naranja", hex: "#f97316" },
  { id: "rojo", name: "Rojo", hex: "#e6506e" },
  { id: "rosa", name: "Rosa", hex: "#db5ce3" },
  { id: "violeta", name: "Violeta", hex: "#7c3aed" },
  { id: "gris", name: "Gris", hex: "#64748b" },
];

const icons = {
  install: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M10 12h4"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  select: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m10 11 4 4m0-4-4 4"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  complete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>',
  pending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  export: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><rect x="4" y="17" width="16" height="4" rx="1"/></svg>',
  import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><rect x="4" y="3" width="16" height="4" rx="1"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  unarchive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="m9 13 3-3 3 3"/></svg>'
};

const state = {
  tasks: [],
  filter: "all",
  query: "",
  selected: new Set(),
  deferredPrompt: null,
  newTaskColor: DEFAULT_COLOR,
};

const el = {
  form: document.getElementById("taskForm"),
  input: document.getElementById("taskInput"),
  taskColorPicker: document.getElementById("taskColorPicker"),
  search: document.getElementById("searchInput"),
  list: document.getElementById("taskList"),
  archivedList: document.getElementById("archivedList"),
  empty: document.getElementById("emptyState"),
  archivedEmpty: document.getElementById("archivedEmpty"),
  results: document.getElementById("resultsText"),
  toast: document.getElementById("toast"),
  bulkBar: document.getElementById("bulkBar"),
  bulkCount: document.getElementById("bulkCount"),
  archivedSheet: document.getElementById("archivedSheet"),
  install: document.getElementById("btnInstall"),
  importInput: document.getElementById("importInput"),
  modal: document.getElementById("appModal"),
  modalForm: document.getElementById("modalForm"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  modalInputWrap: document.getElementById("modalInputWrap"),
  modalInput: document.getElementById("modalInput"),
  modalConfirm: document.getElementById("modalConfirm"),
  modalCancel: document.getElementById("modalCancel"),
};

function paintStaticIcons() {
  document.getElementById("btnInstall").innerHTML = icons.install;
  document.getElementById("btnShowArchived").innerHTML = icons.archive;
  document.getElementById("btnCreate").innerHTML = icons.add;
  document.getElementById("bulkComplete").innerHTML = icons.complete;
  document.getElementById("bulkPending").innerHTML = icons.pending;
  document.getElementById("bulkArchive").innerHTML = icons.archive;
  document.getElementById("bulkDelete").innerHTML = icons.delete;
  document.getElementById("btnExport").innerHTML = icons.export;
  document.querySelector('label[for="importInput"]').innerHTML = icons.import;
  document.getElementById("btnCloseArchived").innerHTML = icons.close;
  syncIconTooltips();
}

function syncIconTooltips() {
  document.querySelectorAll('.icon-btn[title], label.icon-btn[title]').forEach((node) => {
    node.setAttribute("data-tooltip", node.getAttribute("title"));
  });
}

function nowISO() {
  return new Date().toISOString();
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fmtDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(text) {
  return (text || "").trim().slice(0, 180);
}

function normalizeColorId(colorId) {
  return COLOR_TAGS.some((tag) => tag.id === colorId) ? colorId : DEFAULT_COLOR;
}

function colorHex(colorId) {
  return COLOR_TAGS.find((tag) => tag.id === colorId)?.hex || COLOR_TAGS[0].hex;
}

function hexToRgbTriplet(hex) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "47,109,245";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    state.tasks = Array.isArray(raw)
      ? raw.map((item) => ({
          id: String(item.id || uid()),
          description: safeText(item.description),
          color: normalizeColorId(item.color),
          status: item.status === "completed" ? "completed" : "pending",
          archived: Boolean(item.archived),
          createdAt: item.createdAt || nowISO(),
          completedAt: item.status === "completed" ? item.completedAt || nowISO() : null,
        }))
      : [];
  } catch {
    state.tasks = [];
  }
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => {
    el.toast.hidden = true;
  }, 1800);
}

function createColorDotButton(tag, isActive, onClick, sizeClass = "") {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `color-dot-btn ${sizeClass}`.trim();
  btn.title = `Etiqueta ${tag.name}`;
  btn.setAttribute("aria-label", `Etiqueta ${tag.name}`);
  btn.dataset.color = tag.id;
  btn.style.setProperty("--dot-color", tag.hex);
  btn.classList.toggle("is-active", isActive);
  btn.addEventListener("click", onClick);
  return btn;
}

function createTaskColorDropdown(task, onColorChange) {
  const details = document.createElement("details");
  details.className = "task-color-dropdown";

  const summary = document.createElement("summary");
  summary.className = "task-color-trigger";
  summary.title = "Cambiar color de etiqueta";
  summary.setAttribute("aria-label", "Cambiar color de etiqueta");
  const current = document.createElement("span");
  current.className = "task-color-current";
  current.style.setProperty("--dot-color", colorHex(task.color));
  summary.append(current);

  const menu = document.createElement("div");
  menu.className = "task-color-menu";

  COLOR_TAGS.forEach((tag) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "task-color-option";
    swatch.title = tag.name;
    swatch.setAttribute("aria-label", `Color ${tag.name}`);
    swatch.style.setProperty("--dot-color", tag.hex);
    swatch.classList.toggle("is-active", normalizeColorId(task.color) === tag.id);
    swatch.addEventListener("click", () => {
      details.open = false;
      onColorChange(tag.id);
    });
    menu.append(swatch);
  });

  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".task-color-dropdown[open]").forEach((other) => {
      if (other !== details) other.removeAttribute("open");
    });
  });

  details.append(summary, menu);
  return details;
}

function renderCreateColorPicker() {
  el.taskColorPicker.innerHTML = "";
  COLOR_TAGS.forEach((tag) => {
    const btn = createColorDotButton(tag, state.newTaskColor === tag.id, () => {
      state.newTaskColor = tag.id;
      renderCreateColorPicker();
    });
    el.taskColorPicker.append(btn);
  });
}

function showModal(options) {
  return new Promise((resolve) => {
    const {
      title,
      body,
      confirmText = "Aceptar",
      cancelText = "Cancelar",
      value = "",
      showInput = false,
      danger = false,
    } = options;

    el.modalTitle.textContent = title;
    el.modalBody.textContent = body;
    el.modalConfirm.textContent = confirmText;
    el.modalCancel.textContent = cancelText;
    el.modalConfirm.classList.toggle("danger", danger);
    el.modalInputWrap.hidden = !showInput;
    el.modalInput.value = showInput ? value : "";

    const close = (result) => {
      el.modal.close();
      el.modalForm.removeEventListener("submit", onSubmit);
      el.modalCancel.removeEventListener("click", onCancel);
      resolve(result);
    };

    const onSubmit = (e) => {
      e.preventDefault();
      close({ confirmed: true, value: safeText(el.modalInput.value) });
    };

    const onCancel = () => close({ confirmed: false, value: "" });

    el.modalForm.addEventListener("submit", onSubmit);
    el.modalCancel.addEventListener("click", onCancel);
    el.modal.showModal();
    if (showInput) el.modalInput.focus();
  });
}

function setStatus(task, status) {
  if (status === "completed") return { ...task, status: "completed", completedAt: task.completedAt || nowISO() };
  return { ...task, status: "pending", completedAt: null };
}

function filteredTasks() {
  const q = state.query.toLowerCase();
  return state.tasks.filter((t) => {
    if (t.archived) return false;
    if (state.filter === "pending" && t.status !== "pending") return false;
    if (state.filter === "completed" && t.status !== "completed") return false;
    return q ? t.description.toLowerCase().includes(q) : true;
  });
}

function areAllActiveSelected() {
  const activeIds = state.tasks.filter((task) => !task.archived).map((task) => task.id);
  if (!activeIds.length) return false;
  return activeIds.every((id) => state.selected.has(id));
}

function areAllStatusSelected(status) {
  const ids = state.tasks.filter((task) => !task.archived && task.status === status).map((task) => task.id);
  if (!ids.length) return false;
  return ids.every((id) => state.selected.has(id));
}

function toggleSelectByStatus(status) {
  const ids = state.tasks.filter((task) => !task.archived && task.status === status).map((task) => task.id);
  if (!ids.length) return;
  const allSelected = ids.every((id) => state.selected.has(id));
  if (allSelected) {
    ids.forEach((id) => state.selected.delete(id));
    return;
  }
  state.selected.clear();
  ids.forEach((id) => state.selected.add(id));
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = task.id;
  li.dataset.state = task.status;
  li.style.setProperty("--task-accent", hexToRgbTriplet(colorHex(task.color)));
  if (state.selected.has(task.id)) li.classList.add("selected");

  li.innerHTML = `
    <input type="checkbox" class="selector" aria-label="Seleccionar tarea" ${state.selected.has(task.id) ? "checked" : ""} />
    <div class="task-main">
      <p class="desc"></p>
      <div class="task-tag-row">
        <div class="task-color-dropdown-wrap"></div>
      </div>
      <span class="state-pill ${task.status}">${task.status === "completed" ? "Completa" : "Pendiente"}</span>
      <p class="meta">Creada ${fmtDate(task.createdAt)}${task.completedAt ? ` · Completada ${fmtDate(task.completedAt)}` : ""}</p>
    </div>
    <div class="row-actions"></div>
  `;

  li.querySelector(".desc").textContent = task.description;
  const colorDropdownWrap = li.querySelector(".task-color-dropdown-wrap");
  colorDropdownWrap.append(
    createTaskColorDropdown(task, (nextColorId) => {
      updateTask(task.id, (t) => ({ ...t, color: normalizeColorId(nextColorId) }));
    })
  );

  const row = li.querySelector(".row-actions");

  const btnEdit = iconAction(icons.edit, "Editar", async () => {
    const modal = await showModal({
      title: "Editar tarea",
      body: "Actualiza la descripción.",
      confirmText: "Guardar",
      showInput: true,
      value: task.description,
    });

    if (!modal.confirmed) return;
    if (!modal.value) {
      toast("Descripción inválida");
      return;
    }

    updateTask(task.id, (t) => ({ ...t, description: modal.value }));
    toast("Tarea actualizada");
  });

  const btnToggle = iconAction(task.status === "completed" ? icons.pending : icons.complete, task.status === "completed" ? "Marcar pendiente" : "Marcar completa", () => {
    updateTask(task.id, (t) => setStatus(t, t.status === "completed" ? "pending" : "completed"));
  });

  const btnArchive = iconAction(task.archived ? icons.unarchive : icons.archive, task.archived ? "Desarchivar" : "Archivar", async () => {
    updateTask(task.id, (t) => ({ ...t, archived: !t.archived }));
  });

  const btnDelete = iconAction(icons.delete, "Eliminar", async () => {
    if (task.status !== "completed") return;

    const modal = await showModal({
      title: "Eliminar tarea",
      body: "Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      danger: true,
    });
    if (!modal.confirmed) return;

    state.tasks = state.tasks.filter((t) => t.id !== task.id);
    state.selected.delete(task.id);
    save();
    render();
    toast("Tarea eliminada");
  });

  row.append(btnEdit, btnToggle);
  if (task.archived || task.status === "completed") row.append(btnArchive);
  if (task.status === "completed") row.append(btnDelete);

  li.querySelector(".selector").addEventListener("change", (e) => {
    if (e.target.checked) state.selected.add(task.id);
    else state.selected.delete(task.id);
    render();
  });

  return li;
}

function renderSeparator(label) {
  const li = document.createElement("li");
  li.className = "list-separator";
  li.setAttribute("aria-hidden", "true");
  li.innerHTML = `<span>${label}</span>`;
  return li;
}

function iconAction(svg, label, handler) {
  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.type = "button";
  btn.innerHTML = svg;
  btn.title = label;
  btn.setAttribute("aria-label", label);
  btn.setAttribute("data-tooltip", label);
  btn.addEventListener("click", handler);
  return btn;
}

function updateTask(id, updater) {
  state.tasks = state.tasks.map((task) => (task.id === id ? updater(task) : task));
  save();
  render();
}

function render() {
  const visible = filteredTasks();
  const archived = state.tasks.filter((t) => t.archived && (!state.query || t.description.toLowerCase().includes(state.query.toLowerCase())));

  el.list.innerHTML = "";
  const pendingVisible = visible.filter((task) => task.status === "pending");
  const completedVisible = visible.filter((task) => task.status === "completed");

  pendingVisible.forEach((task) => el.list.append(renderTask(task)));
  if (pendingVisible.length && completedVisible.length) {
    el.list.append(renderSeparator("Completadas"));
  }
  completedVisible.forEach((task) => el.list.append(renderTask(task)));

  el.archivedList.innerHTML = "";
  archived.forEach((task) => el.archivedList.append(renderTask(task)));

  el.empty.hidden = visible.length > 0;
  el.archivedEmpty.hidden = archived.length > 0;
  el.results.textContent = `${visible.length} resultado(s)`;
  el.bulkBar.hidden = state.selected.size < 2;
  el.bulkCount.textContent = `${state.selected.size} seleccionadas`;
  const selectAllBtn = document.getElementById("selectAll");
  const allSelected = areAllActiveSelected();
  selectAllBtn.textContent = allSelected ? "Deseleccionar todas" : "Seleccionar todas";
  selectAllBtn.setAttribute("aria-label", selectAllBtn.textContent);
  selectAllBtn.title = selectAllBtn.textContent;
  const selectPendingBtn = document.getElementById("selectPending");
  const pendingSelected = areAllStatusSelected("pending");
  selectPendingBtn.textContent = pendingSelected ? "Deseleccionar pendientes" : "Seleccionar pendientes";
  const selectCompletedBtn = document.getElementById("selectCompleted");
  const completedSelected = areAllStatusSelected("completed");
  selectCompletedBtn.textContent = completedSelected ? "Deseleccionar completas" : "Seleccionar completas";

  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.filter === state.filter));
}

async function applyBulk(action) {
  if (!state.selected.size) {
    toast("Selecciona al menos una tarea");
    return;
  }

  const ids = new Set(state.selected);

  if (action === "delete") {
    const removable = state.tasks.filter((t) => ids.has(t.id) && t.status === "completed").map((t) => t.id);
    if (!removable.length) {
      toast("No hay completas seleccionadas para eliminar");
      return;
    }

    const modal = await showModal({
      title: "Eliminar seleccionadas",
      body: `Se eliminarán ${removable.length} tarea(s) completas.`,
      confirmText: "Eliminar",
      danger: true,
    });
    if (!modal.confirmed) return;

    state.tasks = state.tasks.filter((t) => !removable.includes(t.id));
    removable.forEach((id) => state.selected.delete(id));
    save();
    render();
    toast(`${removable.length} eliminadas`);
    return;
  }

  state.tasks = state.tasks.map((task) => {
    if (!ids.has(task.id)) return task;
    if (action === "complete") return setStatus(task, "completed");
    if (action === "pending") return setStatus(task, "pending");
    if (action === "archive" && task.status === "completed") return { ...task, archived: true };
    return task;
  });

  save();
  render();
  toast("Acción masiva aplicada");
}

function exportTasks() {
  const payload = { exportedAt: nowISO(), app: "Ritmo", tasks: state.tasks };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ritmo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importTasks(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
      if (!Array.isArray(tasks)) throw new Error("invalid");

      const normalized = tasks
        .map((item) => ({
          id: String(item.id || uid()),
          description: safeText(item.description),
          color: normalizeColorId(item.color),
          status: item.status === "completed" ? "completed" : "pending",
          archived: Boolean(item.archived),
          createdAt: item.createdAt || nowISO(),
          completedAt: item.status === "completed" ? item.completedAt || nowISO() : null,
        }))
        .filter((t) => t.description);

      const modal = await showModal({
        title: "Importar tareas",
        body: `Se reemplazarán las tareas actuales por ${normalized.length} tarea(s) del archivo.`,
        confirmText: "Importar",
      });
      if (!modal.confirmed) return;

      state.tasks = normalized;
      state.selected.clear();
      save();
      render();
      toast("Importación completada");
    } catch {
      await showModal({
        title: "Importación fallida",
        body: "El archivo no tiene un formato JSON válido para esta app.",
        confirmText: "Entendido",
        cancelText: "Cerrar",
      });
    }
  };
  reader.readAsText(file);
}

function setupEvents() {
  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = safeText(el.input.value);
    if (!description) {
      toast("Escribe una descripción");
      return;
    }

    state.tasks.unshift({
      id: uid(),
      description,
      color: state.newTaskColor,
      status: "pending",
      archived: false,
      createdAt: nowISO(),
      completedAt: null,
    });

    save();
    el.form.reset();
    state.newTaskColor = DEFAULT_COLOR;
    renderCreateColorPicker();
    render();
    el.input.focus();
  });

  el.search.addEventListener("input", () => {
    state.query = el.search.value.trim();
    render();
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.filter;
      render();
    });
  });

  document.getElementById("selectAll").addEventListener("click", () => {
    const allSelected = areAllActiveSelected();
    if (allSelected) {
      state.tasks.filter((task) => !task.archived).forEach((task) => state.selected.delete(task.id));
    } else {
      state.tasks.filter((task) => !task.archived).forEach((task) => state.selected.add(task.id));
    }
    render();
  });

  document.getElementById("selectPending").addEventListener("click", () => {
    toggleSelectByStatus("pending");
    render();
  });

  document.getElementById("selectCompleted").addEventListener("click", () => {
    toggleSelectByStatus("completed");
    render();
  });

  document.getElementById("bulkComplete").addEventListener("click", () => applyBulk("complete"));
  document.getElementById("bulkPending").addEventListener("click", () => applyBulk("pending"));
  document.getElementById("bulkArchive").addEventListener("click", () => applyBulk("archive"));
  document.getElementById("bulkDelete").addEventListener("click", () => applyBulk("delete"));

  document.getElementById("btnShowArchived").addEventListener("click", () => {
    el.archivedSheet.hidden = false;
  });

  document.getElementById("btnCloseArchived").addEventListener("click", () => {
    el.archivedSheet.hidden = true;
  });

  document.getElementById("btnExport").addEventListener("click", exportTasks);

  el.importInput.addEventListener("change", () => {
    const [file] = el.importInput.files || [];
    if (file) importTasks(file);
    el.importInput.value = "";
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    el.install.hidden = false;
  });

  el.install.addEventListener("click", async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      el.install.hidden = true;
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const insecure = !window.isSecureContext;
    const manualMessage = insecure
      ? "La instalación PWA requiere HTTPS o localhost. Abre esta app desde http://localhost (no file://) y vuelve a intentar."
      : isIOS
        ? "En Safari iOS usa Compartir y luego 'Agregar a pantalla de inicio'."
        : "Si no aparece el instalador automático, abre el menú del navegador y elige 'Instalar app' o 'Agregar a pantalla de inicio'.";

    await showModal({
      title: "Instalación manual",
      body: manualMessage,
      confirmText: "Entendido",
      cancelText: "Cerrar",
    });
  });

  window.addEventListener("appinstalled", () => {
    state.deferredPrompt = null;
    el.install.hidden = true;
    toast("App instalada");
  });
}

async function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch {
    // ignore
  }
}

function bootstrap() {
  paintStaticIcons();
  renderCreateColorPicker();
  load();
  setupEvents();
  if (!isStandaloneMode()) el.install.hidden = false;
  render();
  registerSW();
}

bootstrap();
