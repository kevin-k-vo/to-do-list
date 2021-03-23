const url = "http://localhost:3000";

document.addEventListener('keypress', function (event) {
	if (event.keyCode === 13 || event.which === 13) {
		event.preventDefault();
		return false;
	}
});

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function number_of_tasks(i) {
	if (i == 1) {
		return i + " task";
	}
	return i + " tasks"
	
}


function populate_table() {
	var req = new XMLHttpRequest();
	req.open('GET', url+'?get=table', true);
	
	req.addEventListener('load', function(){
		if (req.status < 400) {
			var response = JSON.parse(req.responseText)
			var tasks = document.getElementById("tasks");		
			
			var date = new Date();
			var monthnames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
			var daynames = ["Sunday,", "Monday,", "Tuesday,", "Wednesday,", "Thursday,", "Friday,", "Saturday,"];
			
			document.getElementById("day").textContent = daynames[date.getDay()];
			document.getElementById("daydate").textContent = ordinal_suffix_of(date.getDate());
			document.getElementById("month").textContent = monthnames[date.getMonth()];
			document.getElementById("year").textContent = date.getFullYear();
			document.getElementById("taskstodo").textContent = number_of_tasks(response.length)
			

			
			for (let i = 0; i < response.length; i++){
				let task = document.createElement("div");
				task.className = "task";
				
				let taskmarker = document.createElement("div");
				taskmarker.className = "taskmarker";
				
				let tasktext = document.createElement("div");
				tasktext.className = "tasktext";
				
				let taskp = document.createElement("p");
				taskp.contentEditable = "true";
				
				//task to-do
				taskp.textContent = response[i].task;
				
				if (response[i].done == 1){
					taskp.className = "done";
				} 

				if (response[i].edited == 0){
					taskp.className = "unedited";
				}

				taskp.addEventListener("blur", function(event){
					var req = new XMLHttpRequest();
					var payload = {
						"action": "updatetask",
						"id": response[i].id,
						"task": taskp.textContent,
						"edited": 1
					};
					
					req.open('POST', url, true);
					req.setRequestHeader('Content-Type', 'application/json');

					req.addEventListener('load',function(){
						if(req.status < 400){
							taskp.className = "";
						} 
						else 
							console.log("Error in network request: " + req.statusText);
						});

					req.send(JSON.stringify(payload));			
					event.preventDefault();
				});
				
				taskp.addEventListener("focus", function(event){
					taskp.className = "";
					if (taskp.textContent == "New Task"){
						taskp.textContent = "";	
					}

				});
				
				tasktext.appendChild(taskp);
				
				let taskactions = document.createElement("div");
				taskactions.className = "taskactions";
				
				let checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				
				if (response[i].done == 1){
					checkbox.checked = true;
				}
				else {
					checkbox.checked = false;
				}
				
				checkbox.addEventListener('change', function(event) {
					var req = new XMLHttpRequest();
					var payload = {
						"action": "updatedone",
						"id": response[i].id,
						"mark": null,
						"edited": 1
					};

					if (this.checked) {
						payload.mark = 1;
					} 
					else {
						payload.mark = 0;
					}
					
					req.open('POST', url, true);
					req.setRequestHeader('Content-Type', 'application/json');

					req.addEventListener('load',function(){
						if(req.status < 400){
							if (checkbox.checked == true){
								taskp.className = "done";
							} 
							else {
								taskp.className = "todo";	
							}
						} 
						else 
							console.log("Error in network request: " + req.statusText);
						});

					req.send(JSON.stringify(payload));			
					event.preventDefault();
				});
				
				let deletebutton = document.createElement("button");
				deletebutton.textContent = "Delete";
				
				deletebutton.addEventListener("click", function(event){
					var req = new XMLHttpRequest();
					var payload = {
						"action": "delete",
						"id": response[i].id
					};

					req.open('POST', url, true);
					req.setRequestHeader('Content-Type', 'application/json');

					req.addEventListener('load',function(){
						if(req.status < 400){
							clear_table();
							populate_table();
						} 
						else 
							console.log("Error in network request: " + req.statusText);
						});

					req.send(JSON.stringify(payload));			
					event.preventDefault();
				});
				
				
				taskactions.appendChild(checkbox);
				taskactions.appendChild(deletebutton);
				
				task.appendChild(taskmarker);
				task.appendChild(tasktext);
				task.appendChild(taskactions);
				
				tasks.appendChild(task);
			}
		}
		else {
			console.log("error");
		}

	})
	req.send(null);
};

document.addEventListener("DOMContentLoaded", function(event) {
	populate_table();
});

function clear_table(){
	var tasks = document.getElementById("tasks");
	tasks.innerHTML = "";	
} 

function addclicked(event) {
	var req = new XMLHttpRequest();
	var payload = {
		"action": "insert",
	};

	req.open('POST', url, true);
	req.setRequestHeader('Content-Type', 'application/json');
	
	req.addEventListener('load',function(){
		if(req.status < 400){
			clear_table();
			populate_table();
		} 
		else 
			console.log("Error in network request: " + req.statusText);
		});
	
	req.send(JSON.stringify(payload));			
	event.preventDefault();
}

document.getElementById("add").addEventListener("click", addclicked);
