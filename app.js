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
