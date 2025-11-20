let todos = [];
let currentFilter = "all";

// Load todos from storage when page loads
function loadTodos() {
  const saved = localStorage.getItem("todos");
  if (saved) {
    todos = JSON.parse(saved);
  }

  // Check URL hash for filter
  const hash = window.location.hash.slice(1);
  if (hash) {
    currentFilter = hash;
    updateFilterButtons();
  }

  renderTodos();
}

// Save todos to storage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Add a new todo
function addTodo(text, parentId = null) {
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
    subtasks: [],
    parentId: parentId,
  };

  if (parentId) {
    // Add as subtask
    const parent = todos.find((t) => t.id === parentId);
    if (parent) {
      parent.subtasks.push(newTodo);
    }
  } else {
    // Add as main todo
    todos.push(newTodo);
  }

  saveTodos();
  renderTodos();
}

// Delete a todo
function deleteTodo(id, parentId = null) {
  if (parentId) {
    // Delete subtask
    const parent = todos.find((t) => t.id === parentId);
    if (parent) {
      parent.subtasks = parent.subtasks.filter((st) => st.id !== id);
    }
  } else {
    // Delete main todo
    todos = todos.filter((t) => t.id !== id);
  }

  saveTodos();
  renderTodos();
}

// Toggle todo completion
function toggleComplete(id, parentId = null) {
  if (parentId) {
    const parent = todos.find((t) => t.id === parentId);
    if (parent) {
      const subtask = parent.subtasks.find((st) => st.id === id);
      if (subtask) {
        subtask.completed = !subtask.completed;
      }
    }
  } else {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  saveTodos();
  renderTodos();
}

// Filter todos based on current filter
function filterTodos() {
  if (currentFilter === "active") {
    return todos.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    return todos.filter((t) => t.completed);
  }
  return todos;
}

// Render all todos
function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  const filtered = filterTodos();

  filtered.forEach((todo) => {
    const li = createTodoElement(todo);
    list.appendChild(li);
  });
}

// Create a todo element
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.draggable = true;
  li.dataset.id = todo.id;

  const content = document.createElement("div");
  content.className = "todo-content";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.completed;
  checkbox.onclick = () => toggleComplete(todo.id);

  const text = document.createElement("span");
  text.className = "todo-text" + (todo.completed ? " completed" : "");
  text.textContent = todo.text;

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const addBtn = document.createElement("button");
  addBtn.className = "btn";
  addBtn.textContent = "+ Sub";
  addBtn.onclick = () => showSubtaskInput(todo.id);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteTodo(todo.id);

  actions.appendChild(addBtn);
  actions.appendChild(deleteBtn);

  content.appendChild(checkbox);
  content.appendChild(text);
  content.appendChild(actions);

  li.appendChild(content);

  // Add subtasks
  if (todo.subtasks.length > 0) {
    const subtaskContainer = document.createElement("div");
    subtaskContainer.className = "subtasks";

    todo.subtasks.forEach((subtask) => {
      const subDiv = createSubtaskElement(subtask, todo.id);
      subtaskContainer.appendChild(subDiv);
    });

    li.appendChild(subtaskContainer);
  }

  // Drag and drop handlers
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("drop", handleDrop);
  li.addEventListener("dragend", handleDragEnd);

  return li;
}

// Create subtask element
function createSubtaskElement(subtask, parentId) {
  const div = document.createElement("div");
  div.className = "subtask";
  div.draggable = true;
  div.dataset.id = subtask.id;
  div.dataset.parentId = parentId;

  const content = document.createElement("div");
  content.className = "todo-content";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = subtask.completed;
  checkbox.onclick = () => toggleComplete(subtask.id, parentId);

  const text = document.createElement("span");
  text.className = "todo-text" + (subtask.completed ? " completed" : "");
  text.textContent = subtask.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteTodo(subtask.id, parentId);

  content.appendChild(checkbox);
  content.appendChild(text);
  content.appendChild(deleteBtn);

  div.appendChild(content);

  // Drag handlers for subtasks
  div.addEventListener("dragstart", handleDragStart);
  div.addEventListener("dragover", handleDragOver);
  div.addEventListener("drop", handleDrop);
  div.addEventListener("dragend", handleDragEnd);

  return div;
}

// Show input for adding subtask
function showSubtaskInput(parentId) {
  const parent = document.querySelector(`[data-id="${parentId}"]`);

  // Remove existing input if any
  const existing = parent.querySelector(".subtask-input");
  if (existing) {
    existing.remove();
    return;
  }

  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-input";
  input.placeholder = "Add subtask and press Enter...";

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      addTodo(input.value.trim(), parentId);
      input.remove();
    }
  });

  parent.appendChild(input);
  input.focus();
}

// Drag and drop variables
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const target = e.target.closest(".todo-item, .subtask");
  if (target && target !== draggedElement) {
    target.classList.add("drag-over");
  }
}

function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest(".todo-item, .subtask");
  if (!target || target === draggedElement) return;

  target.classList.remove("drag-over");

  const draggedId = parseInt(draggedElement.dataset.id);
  const targetId = parseInt(target.dataset.id);

  // Reorder todos
  const draggedIndex = todos.findIndex((t) => t.id === draggedId);
  const targetIndex = todos.findIndex((t) => t.id === targetId);

  if (draggedIndex !== -1 && targetIndex !== -1) {
    const temp = todos[draggedIndex];
    todos.splice(draggedIndex, 1);
    todos.splice(targetIndex, 0, temp);
    saveTodos();
    renderTodos();
  }
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  document.querySelectorAll(".drag-over").forEach((el) => {
    el.classList.remove("drag-over");
  });
}

// Filter button handlers
function updateFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add("active");
    }
  });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    window.location.hash = currentFilter;
    updateFilterButtons();
    renderTodos();
  });
});

// Input handler for adding todos
document.getElementById("todoInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter" && e.target.value.trim()) {
    addTodo(e.target.value.trim());
    e.target.value = "";
  }
});

// Listen for hash changes
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    currentFilter = hash;
    updateFilterButtons();
    renderTodos();
  }
});

// Load todos when page loads
loadTodos();
