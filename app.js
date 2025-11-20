// Get HTML elements
const newTodoInput = document.getElementById("new-todo-input");
const todoList = document.getElementById("todo-list");

let todos = [];
let currentFilter = "all";

const STORAGE_KEY = "nested_todos_v1";

let draggedTodoId = null;
let draggedIsParent = false;

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    todos = JSON.parse(raw);
  } catch (e) {
    console.error("ERROR paring todos from storage", e);
    todos = [];
  }
}

newTodoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const text = newTodoInput.value.trim(); // remove extra spaces

    if (text === "") {
      return;
    }

    addTodo(text);
    newTodoInput.value = "";
  }
});

function addTodo(text, parentId = null) {
  const todo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    parentId: parentId,
  };

  todos.push(todo);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";

  const topLevelTodos = todos.filter((t) => {
    if (t.parentId !== null) return false;

    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  topLevelTodos.forEach((parent) => {
    const parentLi = createTodoElement(parent, false);
    todoList.appendChild(parentLi);

    const subtasks = todos.filter((t) => {
      if (t.parentId !== parent.id) return false;

      if (currentFilter === "active") return !t.completed;
      if (currentFilter === "completed") return t.completed;
      return true;
    });

    subtasks.forEach((sub) => {
      const subLi = createTodoElement(sub, true);
      todoList.appendChild(subLi);
    });
  });
}

function createTodoElement(todo, isSubtask) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;

  if (isSubtask) {
    li.classList.add("subtask");
  }

  li.draggable = true;

  li.addEventListener("dragstart", () => {
    draggedTodoId = todo.id;
    draggedIsParent = !isSubtask;
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    draggedTodoId = null;
    draggedIsParent = false;
  });

  li.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  li.addEventListener("drop", (e) => {
    e.preventDefault();
    handleDropOnTodo(todo, isSubtask);
  });

  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  checkbox.addEventListener("change", function () {
    todo.completed = checkbox.checked;
    saveTodos();
    renderTodos();
  });

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = todo.text;

  if (todo.completed) {
    textSpan.style.textDecoration = "line-through";
    textSpan.style.opacity = "0.6";
  } else {
    textSpan.style.textDecoration = "none";
    textSpan.style.opacity = "1";
  }

  left.appendChild(checkbox);
  left.appendChild(textSpan);

  const right = document.createElement("div");
  right.className = "todo-right";

  if (!isSubtask) {
    const addSubtaskBtn = document.createElement("button");
    addSubtaskBtn.className = "subtask-btn";
    addSubtaskBtn.textContent = "+ Subtask";

    addSubtaskBtn.addEventListener("click", function () {
      const subtaskText = prompt("Enter Subtask:");
      if (!subtaskText) return;

      addTodo(subtaskText.trim(), todo.id); // parentId = this todo's id
    });

    right.appendChild(addSubtaskBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", function () {
    if (isSubtask) {
      todos = todos.filter((t) => t.id !== todo.id);
    } else {
      todos = todos.filter((t) => t.id !== todo.id && t.parentId !== todo.id);
    }
    saveTodos();
    renderTodos();
  });

  right.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(right);

  return li;
}

renderTodos();

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    window.location.hash = currentFilter;

    document
      .querySelectorAll(".filter-button")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");
    renderTodos();
  });
});

window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");

  if (hash === "all" || hash === "active" || hash === "completed") {
    currentFilter = hash;
  }
  document.querySelectorAll(".filter-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
  renderTodos();
});
