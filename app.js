// Get HTML elements
const newTodoInput = document.getElementById("new-todo-input");
const todoList = document.getElementById("todo-list");

// This array stores all our todos
let todos = []; // each todo: { id, text, completed, parentId }

// -----------------------------
// Add todo when user presses Enter
// -----------------------------
newTodoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const text = newTodoInput.value.trim(); // remove extra spaces

    if (text === "") {
      return;
    }

    // top-level todo, so parentId = null
    addTodo(text);
    newTodoInput.value = "";
  }
});

// -----------------------------
// Create and store new todo
// -----------------------------
function addTodo(text, parentId = null) {
  const todo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    parentId: parentId, // null = top-level, otherwise parent todo's id
  };

  todos.push(todo);
  renderTodos();
}

// -----------------------------
// Render all todos (parents + subtasks)
// -----------------------------
function renderTodos() {
  // clear the list
  todoList.innerHTML = "";

  // 1) get all top-level todos
  const topLevelTodos = todos.filter((t) => t.parentId === null);

  topLevelTodos.forEach((parent) => {
    // render parent row
    const parentLi = createTodoElement(parent, false);
    todoList.appendChild(parentLi);

    // 2) get its subtasks
    const subtasks = todos.filter((t) => t.parentId === parent.id);

    subtasks.forEach((sub) => {
      const subLi = createTodoElement(sub, true);
      todoList.appendChild(subLi);
    });
  });
}

// -----------------------------
// Create a single <li> element
// -----------------------------
function createTodoElement(todo, isSubtask) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = todo.id;

  if (isSubtask) {
    li.classList.add("subtask");
  }

  // -------- LEFT: checkbox + text --------
  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  checkbox.addEventListener("change", function () {
    todo.completed = checkbox.checked;
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

  // -------- RIGHT: buttons --------
  const right = document.createElement("div");
  right.className = "todo-right";

  // Only parents get "+ Subtask" (1-level nesting only)
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
      // delete only this subtask
      todos = todos.filter((t) => t.id !== todo.id);
    } else {
      // delete this parent AND its subtasks
      todos = todos.filter((t) => t.id !== todo.id && t.parentId !== todo.id);
    }
    renderTodos();
  });

  right.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(right);

  return li;
}

// initial render
renderTodos();
