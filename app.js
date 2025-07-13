const apiUrl = "https://todoapp-backend-production-c671.up.railway.app/api/tasks";

// LOAD TASKS ON PAGE LOAD
document.addEventListener("DOMContentLoaded",() => {
    const taskInput = document.getElementById("task-input");
    const addBtn = document.getElementById("add-btn");  
    const taskList = document.querySelector(".task-items");

    loadTasks();

    // ADD TASK ON BUTTON CLICK
    addBtn.addEventListener("click",() => {
              addTask(taskInput,taskList);
    });

     //  ADD TASK ON ENTER KEY PRESS 
    taskInput.addEventListener("keypress",event => {
      if(event.key === "Enter"){
        addTask(taskInput,taskList);
    }
});
});

async function loadTasks(){
    try{

    const res = await fetch(apiUrl);
    const tasks = await res.json();
    tasks.forEach((task) => {
        addTaskToDOM(task);
    });
    }
    catch(error){
        console.error("❌ Failed to load tasks",error)
    }
}

async function addTask(taskInput,taskList){
    const taskText = taskInput.value.trim();
    if(!taskText) return;

    const newTask ={
        name : taskText,
        completed : false
    };

    try{
    const res = await  fetch(apiUrl,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(newTask)
    });
      
      const savedTask = await res.json();
      addTaskToDOM(savedTask);
      taskInput.value = ""; 
    } 
    catch(error){
        console.error("❌ Failed to add task",error)
    }
}

function addTaskToDOM(task){

    const taskList = document.querySelector(".task-items");

     const taskItem = document.createElement("div");
     taskItem.classList.add("task-item","fade-in");
     if(task.completed){
        taskItem.classList.add("completed");
     }

     const taskName = document.createElement("span");
           taskName.className = "task-name";
           taskName.textContent = task.name;

           // SHARED EDIT LOGIC(dbloclick or icon)
           const startEditing = () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = task.name;
            input.className = "edit-input";
            taskItem.replaceChild(input,taskName);
            input.focus();

            input.addEventListener("keydown",async(e) => {
                if(e.key === "Enter"){
                    const newName = input.value.trim();
                    if(!newName || newName === task.name){
                        taskItem.replaceChild(taskName,input);
                        return;
                    }
                    try{
                        const updatedTask = { ...task, name : newName };

                        const res = await fetch(`${apiUrl}/${task.id}`,{
                method : "PUT",
                headers : {
               "Content-Type" : "application/json"
             },
                body : JSON.stringify(updatedTask)
             });

             const data = await res.json();
             task.name = data.name;
             taskName.textContent = data.name;
             taskItem.replaceChild(taskName,input)
                    }
                    catch(error){
                        console.error("❌ Failed to update task",error);
                    }
                }
            });
           };

           // DOUBLE CLICK TO EDIT
            taskName.addEventListener("dblclick",startEditing);

            // ACTION BUTTONS
            const actions = document.createElement("div");
            actions.className = "actions";

            // CHECK BUTTON 
            const checkBtn = document.createElement("button");
            checkBtn.className = "check-btn";
            checkBtn.textContent = "✅";
            checkBtn.addEventListener("click", () => {
                toggleTask(task,taskItem)
            });

            // EDIT BUTTON
            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.textContent = "✏️"
            editBtn.addEventListener("click",startEditing);

            // DELETE BUTTON
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click",() => {
                deleteTask(task.id,taskItem);
            });

            // ADD BUTTONS TO ACTIONS
            actions.appendChild(checkBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            // BUILD THE TASK ITEM
            taskItem.appendChild(taskName);
            taskItem.appendChild(actions);

            // ADD TO TASK LIST
            taskList.appendChild(taskItem);
}

async function toggleTask(task,taskItem){
    const updatedTask = { ...task , 
        completed : !task.completed
    };

    try{
    const res = await fetch(`${apiUrl}/${task.id}`,{
        method : "PUT",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(updatedTask)
    });
    
    const data = await res.json();
    task.completed = data.completed;
    taskItem.classList.toggle("completed");
}
catch(error){
    console.error("❌ Failed to toggle task",error)
}
}

async function deleteTask(id,taskItem){
    try{
      await fetch(`${apiUrl}/${id}`,{
        method : "DELETE"
      });
      taskItem.remove();
    }
    catch(error){
        console.error("❌ Failed to delete task",error)
    }
}


