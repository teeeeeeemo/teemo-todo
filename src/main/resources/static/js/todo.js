var baseUrl = "http://localhost:3333/v1/todos";

/* Handle EnterKey: Create, Update TodoItem Name */
function handleEnterKey(e) {
	//
	if ( e.keyCode === 13 ) {
		e.preventDefault(); // keycode 13 (enter) 이벤트 이외의 별도 브라우저 행동을 막음
		var taskName = document.getElementById( 'taskNameTextField' ).value;
		
		// input field 초기화
		$( "#taskNameTextField" ).val( '' );
		
		// Check if we are editing or not
		var isEditing = $( "#taskNameTextField" ).attr(" isEditing" );
		if ( isEditing ) {
			// Clear editing flag
			$( "#taskNameTextField" ).removeAttr( "isEditing" );
			var itemId = $("#taskNameTextField").attr( "editingItemId" );
			$( "#taskNameTextField" ).removeAttr( "editingItemId" );
			putEditTodoItem( itemId, taskName );
		} else {
			postTodoItem( taskName );
		}
		
	}
}

/* Post Todo Item */
function postTodoItem( taskName ) {
	//
	var newTodoItem = {
			taskName: taskName
	};
	var requestUrl  = baseUrl;
	var requestJSON = JSON.stringify( newTodoItem );
	$.ajax({
		type: "POST",
		url: requestUrl,
		headers: {
			"Content-Type": "application/json"
		},
		data: requestJSON,
		async: false,
		success: function ( res ) {
			createTodoRow( res.data );
		},
		error: function ( res ) {
			alert('Input Task Name!');
		}
	});
	reloadTodoList();
}

/* Reload Todo List */
function reloadTodoList() {
	//
	var requestUrl = baseUrl + "/pagination";
	$.ajax({
		type: "GET",
		url: requestUrl,
		headers: {
			"Content-Type": "application/json"
		},
		success: function ( res ) {
			var cList = $( 'ul.todo-list' );
			cList.empty();
			$.each( res.data.todoList, function( i, todoObj ) {
//				if ( todoObj.isDone ) {
//					li.addClass( 'completed' );
//				}
				createTodoRow( todoObj );
			});
			var p = $( 'div.pagination' );
			p.empty();
			$.each( res.data.pageList, function( i, pageList ) {
				var p = $('div.pagination' )
				var li = $( '<a id="pagination" href="#">' + pageList + '</a>' )
					.attr( "pagenum", pageList )
					.attr( "onclick", "handleTodoListPagination( $( this ).attr( 'pagenum' ) )" )
					.appendTo( p );
			});
		},
		error: function ( res ) { }
	});
}

/* Create Todo Row */
function createTodoRow( todoObj ) {
	//
	var cList = $( 'ul.todo-list' );
	var li = $( '<li/>' )
		.attr( "id", "item" + todoObj.itemId )
		.appendTo(cList);
	var todoRow = $( '<div/>' )
	    .addClass( 'todo-row')
	    .appendTo( li );
	
	if ( todoObj.isDone ) {
		li.addClass( 'completed' );
	}
	
	// Task Name
	var todoTitle = $( '<span/>' )
		.addClass( 'todo-title' )
		.text( todoObj.taskName )
		.appendTo( todoRow );
}