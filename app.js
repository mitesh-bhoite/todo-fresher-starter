//Get HTML elements
const newTodoInput = document.getElementById("new-todo-input");
const todoList = document.getElementById("todo-list");
const todos = []; // This array store all our todos.

//Add todo when user presses Enter

newTodoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const text = newTodoInput.value.trim(); //remove extra spaces

    if (text === "") {
      return;
    }

    addTodo(text);
    newTodoInput.value = "";
  }
});

//stores text(todos) in the array
function addTodo(text) {
  const todo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    parentId: null,
  };

  todos.push(todo);
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";
  const topLevelTodos = todos.filter((t) => t.parentId === null);

  topLevelTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

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
    }

    left.appendChild(checkbox);
    left.appendChild(textSpan);

    const right = document.createElement("div");
    right.className = "todo-right";

    const addSubtaskBtn = document.createElement("button");
    addSubtaskBtn.className = "subtask-btn";
    addSubtaskBtn.textContent = "+  Subtask";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", function () {
      todos = todos.filter((t) => t.id !== todo.id);
      renderTodos();
    });

    right.appendChild(addSubtaskBtn);
    right.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(right);

    todoList.appendChild(li);
  });
}
renderTodos();
