const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const noTasksMessage = document.getElementById("noTasksMessage");

let allTasks = [];

// Modal açma ve kapama
addTaskBtn.onclick = () => taskModal.style.display = "block";
closeModal.onclick = cancelBtn.onclick = () => taskModal.style.display = "none";
window.onclick = (e) => {
  if (e.target === taskModal) taskModal.style.display = "none";
};

// Tekli görev kartı oluşturma
function renderTask(task) {
  const li = document.createElement("li");
  li.className = task.completed ? "completed" : "";
  li.innerHTML = `
    <div>
      <strong>${task.title}</strong><br>
      ${task.description || ""}<br>
      <small>📅 ${task.dueDate || "Yok"} | 🔥 ${task.priority || "Belirtilmemiş"}</small>
    </div>
  `;

  if (!task.completed) {
    const completeBtn = document.createElement("button");
    completeBtn.className = "complete-btn";
    completeBtn.textContent = "Tamamla";
    completeBtn.onclick = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tasks/${task.id}/complete`, { method: "PUT" });
        if (res.ok) {
          li.classList.add("completed");
          completeBtn.remove();
        }
      } catch (err) {
        console.error("Tamamlama hatası:", err);
      }
    };
    li.appendChild(completeBtn);
  }

  taskList.appendChild(li);
}

// Listeyi yeniden çiz
function renderTaskList(taskArray) {
  taskList.innerHTML = "";
  if (taskArray.length === 0) {
    noTasksMessage.style.display = "block";
  } else {
    noTasksMessage.style.display = "none";
    taskArray.forEach(renderTask);
  }
}

// Yeni görev ekleme
saveTaskBtn.onclick = async () => {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const dueDate = document.getElementById("taskDueDate").value;
  const priority = document.getElementById("priority-select").value;

  if (title) {
    try {
      const res = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate, priority })
      });

      if (res.ok) {
        const newTask = await res.json();
        allTasks.push(newTask);
        renderTaskList(allTasks);
        taskModal.style.display = "none";
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskDueDate").value = "";
        document.getElementById("priority-select").value = "";
      }
    } catch (err) {
      console.error("Görev ekleme hatası:", err);
    }
  }
};

// Sayfa yüklendiğinde görevleri getir
window.onload = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/tasks");
    allTasks = await res.json();
    renderTaskList(allTasks);
  } catch (err) {
    console.error("Görev yükleme hatası:", err);
  }
};

// Arama özelliği
searchInput.oninput = () => {
  const term = searchInput.value.toLowerCase();
  const filtered = allTasks.filter(task =>
    task.title.toLowerCase().includes(term) ||
    (task.description || "").toLowerCase().includes(term)
  );
  renderTaskList(filtered);
};
