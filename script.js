const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority-input");
const list = document.getElementById("task-list");
const feedback = document.getElementById("feedback");
const feedbackAlert = feedback.querySelector(".alert");
const tasksCount = document.getElementById("tasks-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

let tasks = [];
let filter = "all";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function save() {
  localStorage.setItem("todo.tasks", JSON.stringify(tasks));
}

function load() {
  const raw = localStorage.getItem("todo.tasks");
  tasks = raw ? JSON.parse(raw) : [];
}

function setFeedback(msg) {
  if (!msg) {
    feedback.classList.add("d-none");
    feedbackAlert.textContent = "";
    return;
  }
  feedback.classList.remove("d-none");
  feedbackAlert.textContent = msg;
}

function render() {
  list.innerHTML = "";
  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });
  filtered.forEach((t) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center justify-content-between gap-2";
    li.dataset.id = t.id;

    const left = document.createElement("div");
    left.className = "d-flex align-items-center gap-2 flex-grow-1";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input me-1";
    checkbox.checked = !!t.completed;
    checkbox.dataset.action = "toggle";

    const textWrap = document.createElement("div");
    textWrap.className = "d-flex align-items-center gap-2 flex-grow-1";

    if (t.editing) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = t.text;
      editInput.className = "form-control";
      editInput.dataset.role = "edit-input";
      textWrap.appendChild(editInput);
    } else {
      const text = document.createElement("span");
      text.textContent = t.text;
      text.className = "task-text";
      if (t.completed) text.classList.add("text-decoration-line-through", "text-body-secondary");
      textWrap.appendChild(text);
      if (t.priority !== "normal") {
        const badge = document.createElement("span");
        badge.className =
          t.priority === "high" ? "badge text-bg-danger" : "badge text-bg-secondary";
        badge.textContent = t.priority;
        textWrap.appendChild(badge);
      }
    }

    left.appendChild(checkbox);
    left.appendChild(textWrap);

    const right = document.createElement("div");
    right.className = "d-flex align-items-center gap-2";

    if (t.editing) {
      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "btn btn-success btn-sm";
      saveBtn.textContent = "Save";
      saveBtn.dataset.action = "save";
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn btn-outline-secondary btn-sm";
      cancelBtn.textContent = "Cancel";
      cancelBtn.dataset.action = "cancel";
      right.appendChild(saveBtn);
      right.appendChild(cancelBtn);
    } else {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-outline-primary btn-sm";
      editBtn.textContent = "Edit";
      editBtn.dataset.action = "edit";
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-outline-danger btn-sm";
      delBtn.textContent = "Delete";
      delBtn.dataset.action = "delete";
      right.appendChild(editBtn);
      right.appendChild(delBtn);
    }

    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
  tasksCount.textContent = tasks.length.toString();
  save();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  const priority = priorityInput.value;
  if (!text) {
    setFeedback("Enter a task");
    input.focus();
    return;
  }
  setFeedback("");
  tasks.push({ id: uid(), text, completed: false, priority, editing: false });
  input.value = "";
  render();
});

list.addEventListener("click", (e) => {
  const target = e.target;
  const li = target.closest("li.list-group-item");
  if (!li) return;
  const id = li.dataset.id;
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const action = target.dataset.action;
  if (action === "toggle") {
    tasks[idx].completed = !tasks[idx].completed;
    render();
  } else if (action === "edit") {
    tasks[idx].editing = true;
    render();
  } else if (action === "delete") {
    tasks.splice(idx, 1);
    render();
  } else if (action === "save") {
    const inputEl = li.querySelector('[data-role="edit-input"]');
    const val = inputEl ? inputEl.value.trim() : "";
    if (!val) return;
    tasks[idx].text = val;
    tasks[idx].editing = false;
    render();
  } else if (action === "cancel") {
    tasks[idx].editing = false;
    render();
  }
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter || "all";
    render();
  });
});

load();
render();
