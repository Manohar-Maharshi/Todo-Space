<script>
	import { db } from '$lib/components/firebase.js';


	let todos = [];
	let task = "";
	let updateTaskText = "";
	let totalTasksCount = 0;
	let totalCompleatedTasks = 0;
	let totalIncompleteTasks = 0;

	db.collection("todos").orderBy("createdAt", "desc").onSnapshot((snapData) => {
		todos = snapData.docs;
	})

	$: db.collection('todos').get().then(snapshot => {
  		totalTasksCount = snapshot.size;
  	});

  	$: db.collection("todos").where("isCompleted", "==", true).get().then((snapshot) => {
        totalCompleatedTasks = snapshot.size;
    });

    $: db.collection("todos").where("isCompleted", "==", false).get().then((snapshot) => {
        totalIncompleteTasks = snapshot.size;
    });




	const addNewTask = () =>{
		if(task){
			db.collection("todos").add({
				task: task,
				createdAt: new Date().getTime(),
				isCompleted: false,
			})
			db.collection('todos').get()
		  		.then(snapshot => {
		  			totalTasksCount = snapshot.size;
		  	});
		  	db.collection("todos").where("isCompleted", "==", false).get().then((snapshot) => {
       			 totalIncompleteTasks = snapshot.size;
    		});
		}
		task = "";
	}

	const keyPressed = (e) =>{
		if(e.key === "Enter"){
			addNewTask();
		}
	}

	const deleteTask = (taskId) =>{
		db.collection("todos").doc(taskId).delete();
		db.collection('todos').get().then(snapshot => {
		  	totalTasksCount = snapshot.size;
		});
	}

	const markAsComplete = (taskId,isCompleted) =>{
		db.collection("todos").doc(taskId).update({
			isCompleted: !isCompleted,
		})
		db.collection("todos").where("isCompleted", "==", true).get().then((snapshot) => {
		    totalCompleatedTasks = snapshot.size;
		});
		db.collection("todos").where("isCompleted", "==", false).get().then((snapshot) => {
        	totalIncompleteTasks = snapshot.size;
   		});
	}

	const updateTask = (taskId,updateTaskText) =>{
		if(updateTaskText){
			db.collection("todos").doc(taskId).update({
				task: updateTaskText,
				recentUpdateTimestamp: new Date().getTime(),
			});
		}	
	}
	const deleteCompletedtasks = async () =>{
		const doc = await db.collection("todos").where('isCompleted', '==', true).get();
		doc.forEach(element => {
		    element.ref.delete();
		});
		db.collection('todos').get().then(snapshot => {
		  	totalTasksCount = snapshot.size;
		});
		db.collection("todos").where("isCompleted", "==", true).get().then((snapshot) => {
       		 totalCompleatedTasks = snapshot.size;
    	});
    	db.collection("todos").where("isCompleted", "==", false).get().then((snapshot) => {
       		 totalIncompleteTasks = snapshot.size;
    	});
	}
</script>

<svelte:window on:keydown={keyPressed} />


<main>
	<div class="form">
		<div class="input-field">
			<input bind:value={task} type="text" maxlength="25" placeholder="Add Tasks...">
			<button on:click={addNewTask} type="button">➕</button>
		</div>
		<div class="indicators">
			<p class="indi-total">Total Tasks: {totalTasksCount}</p>
			{#if totalCompleatedTasks > 0}
				<p class="indi-done">
					Completed Tasks: {totalCompleatedTasks}
					<span title="Delete all completed tasks" on:click={deleteCompletedtasks} class="del-btn">❌</span>
				</p>
			{:else}
				<p class="indi-done">
					Completed Tasks: {totalCompleatedTasks}
				</p>
			{/if}
			<p class="indi-total">Remaining Tasks: {totalIncompleteTasks}</p>
		</div>
	</div>
	<ul>
		{#each todos as task}	
			<li>
				{#if task.editMode}
					<div class="update-task">
						<input value={task.data().task} bind:this={task.inputEl} type="text" maxlength="25">
						<button on:click={() => updateTask(task.id,task.inputEl.value)} type="button">📝</button>
					</div>
				{:else}
					<button title="Mark it Completed" class="util-btn" on:click={() => markAsComplete(task.id,task.data().isCompleted)}>✔</button>
					<span title="Double click to edit task" class="todo-text" on:dblclick={
						() => {task.editMode = true;
						todos = todos;
					}} 
					class:completed={task.data().isCompleted}>
						{task.data().task}
					</span>
					<button title="Delete Task" class="util-btn" on:click={() => deleteTask(task.id)}>🗑️</button>
				{/if}
			</li>
		{:else}
			No Tasks...
		{/each}
	</ul>
</main>


<style>
	main{
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.del-btn{
		cursor: pointer;
		font-size: 0.8rem;
		padding-bottom: 0.15rem;
		padding-left: 0.2rem;
	}
	.indi-done{
		display: flex;
		align-items: center;
	}
	button:active{
		transform: scale(1.1);
	}
	.util-btn{
		transform: scale(1.3);
	}
	.completed{
		text-decoration: line-through;
		opacity: 0.5;
		color: green;
	}
	.update-task{
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.update-task input{
		border: 0;
		outline: 0;
		padding: 0.5rem 1rem;
		background-color: firebrick;
		font-size: 1.2rem;
		margin-right: 0.5rem;
		color: black;
	}
	.update-task button{
		border: 0;
		outline: 0;
		width: 5rem;
		padding: 0.5rem 1rem;
		height: inherit;
		background-color: crimson;
		cursor: pointer;
		font-size: 1.2rem;
	}
	.update-task button:active{
		transform: scale(1.1);
	}
	ul{
		margin-top: 8rem;
		padding: 0 2rem;
		width: 50%;
		height: 80vh;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		flex-direction: column;
		background-color: blanchedalmond;
		margin-bottom: 10rem;
	}
	li{
		width: 100%;
		height: 2rem;
		padding: 1rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		list-style: none;
		margin: 1rem 0;
		background-color: burlywood;
	}
	.todo-text{
		font-size: 1.3rem;
		margin-left: 2rem;
		flex: 1;
		width: 100%;
		text-transform: capitalize;
	}
	.form{
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		position: fixed;
		top: 0;
		margin-bottom: 1rem;
		padding: 1rem 0;
		z-index: 10;
		background-color: lightslategrey;
		box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
	}
	.form .indicators{
		display: flex;
		margin: 0;
		padding: 0;
	}
	.indicators p{
		margin: 0;
		padding: 0;
		margin-right: 1rem;
		margin-top: 1rem;
		font-size: 1rem;
	}
	.form input{
		width: 20rem;
		border: 0;
		outline: 0;
		padding: 0.5rem 1rem;
		background: darksalmon;
		font-size: 1.2rem;
		margin-right: 0.5rem;
		color: black;
	}
	.form button{
		border: 0;
		outline: 0;
		width: 5rem;
		padding: 0.8rem 1rem;
		height: inherit;
		background-color: goldenrod;
		cursor: pointer;
	}
	.form button:active{
		transform: scale(1.1);
	}
</style>
