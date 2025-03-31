let dragCard = null;
let rigthClicked = null;

document.addEventListener("DOMContentLoaded",loadTasksFromLocalStorage)

function addTask(columnId){
    const input = document.getElementById(`${columnId}-input`)
    const taskText = input.value.trim();

    if(taskText === ""){
        return;
    }
     const taskDate = new Date().toLocaleString();

    const taskElement = createTaskElement(taskText,taskDate);

    document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
    updateTasksCount(columnId);

    saveTasksToLocalStorage(columnId,taskText, taskDate);

    input.value = "";
}

function createTaskElement(taskText,taskDate){
    const element = document.createElement("div");
    element.innerHTML = `<span>${taskText}</span><br><small class="time">${taskDate}</small>`;
    element.classList.add("card");
    element.setAttribute("draggable",true)
    element.addEventListener("dragstart",dragStart)
    element.addEventListener("dragend",dragEnd)
    element.addEventListener("contextmenu", function(event){
        event.preventDefault();
        rigthClicked = this;
        showContextMenu(event.pageX,event.pageY)
    })
    return element;
}

function dragStart(){
    this.classList.add("dragging");
    dragCard = this;
}

function dragEnd(){
    this.classList.remove("dragging");
    dragCard = null;
    ["todo","doing","done"].forEach((columnId)=>{
        updateTasksCount(columnId)
        updateLocalStorage();
    })
}

const columns = document.querySelectorAll(".tasks");
columns.forEach((column)=>{
   column.addEventListener("dragover",dragOver);
})

function dragOver(event){
  event.preventDefault();
  const draggedCard = document.querySelector(".dragging");
//this.appendChild(dragCard);
  const afterElement = getDragAfterElement(this , event.pageY);

  if(afterElement === null){
     this.appendChild(draggedCard);
  }else{
    this.insertBefore(draggedCard, afterElement);
  }
}

function getDragAfterElement(container,y){
    const draggableElements = [
        ...container.querySelectorAll(".card:not(.dragging)"),
    ];

    const result = draggableElements.reduce(
        (closestElementUnderMouse, currentTask) =>{
            const box = currentTask.getBoundingClientRect();
            const offset = y - (box.top + box.height/2);
            if(offset<0 && offset> closestElementUnderMouse.offset){
                return {offset: offset, element: currentTask};
            }else{
                return closestElementUnderMouse;
            }
        },
         {offset: Number.NEGATIVE_INFINITY}
    )
     return result.element;
}

const contextMenu = document.querySelector(".context-menu")
function showContextMenu(x,y){
   contextMenu.style.left = `${x}px`
   contextMenu.style.top = `${y}px`
   contextMenu.style.display = "block"
}

document.addEventListener("click",()=>{
    contextMenu.style.display = "none"
})

function editTask(){
    if(rigthClicked !== null){
       const newTaskText = prompt("Edit Task-", rigthClicked.textContent)
       if(newTaskText!==""){
           rigthClicked.textContent = newTaskText;
           updateLocalStorage();
       }  
    }
}

function deleteTask(){
    if(rigthClicked!==null){
        const columnId = rigthClicked.parentElement.id.replace("-tasks","");
        rigthClicked.remove();
        updateTasksCount(columnId);
        updateLocalStorage();
    }
}

function updateTasksCount(columnId) {
   const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
   document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasksToLocalStorage(columnId,taskText, taskDate) {
    const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
    tasks.push({text: taskText,date: taskDate})
    localStorage.setItem(columnId,JSON.stringify(tasks))
}

function loadTasksFromLocalStorage() {
   ["todo","doing","done"].forEach((columnId)=>{
      const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
      tasks.forEach(({text,date})=>{
         const taskElement = createTaskElement(text,date)
         document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
      })
      updateTasksCount(columnId)
   })
}

function updateLocalStorage() {
    ["todo","doing","done"].forEach((columnId)=>{
       const tasks =[];
       document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
        const taskText = card.querySelector("span").textContent
        const taskDate = card.querySelector("small").textContent
        tasks.push({text: taskText, date: taskDate})
       })
       localStorage.setItem(columnId,JSON.stringify(tasks));
    })
}