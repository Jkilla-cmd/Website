
function login() {
  const username = document.getElementById("username").value.trim();
  if (username) {
    localStorage.setItem("taskUser", username);
    document.getElementById("user-name").textContent = username;
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("task-app").classList.remove("hidden");
    loadTasks();
  }
}

function logout() {
  localStorage.removeItem("taskUser");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("task-app").classList.add("hidden");
  document.getElementById("task-list").innerHTML = "";
}

function addTask() {
  const taskInput = document.getElementById("new-task");
  const taskText = taskInput.value.trim();
  if (taskText) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    taskInput.value = "";
    loadTasks();
  }
}

function loadTasks() {
  const taskList = document.getElementById("task-list");
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task;
    const btn = document.createElement("button");
    btn.textContent = "✖";
    btn.onclick = () => {
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      loadTasks();
    };
    li.appendChild(btn);
    taskList.appendChild(li);
  });
}

window.onload = () => {
  const username = localStorage.getItem("taskUser");
  if (username) {
    document.getElementById("user-name").textContent = username;
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("task-app").classList.remove("hidden");
    loadTasks();
  }
};
