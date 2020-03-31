var baseUrl = "http://localhost:3333/v1/todos";

$(document).ready( function() {
	reloadTodoList();
});

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
		async: false,
		url: requestUrl,
		headers: {
			"Content-Type": "application/json"
		},
		data: requestJSON,
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
				createTodoRow( todoObj );
			});
			
			var p = $( 'div.pagination' );
			p.empty();
			
			$.each( res.data.pageList, function( i, pageList ) {
				var p = $('div.pagination' )
				var li = $( '<a id="pagination" href="#">' + pageList + '</a>' )
					.attr( "pagenum", pageList )
					.attr( "onclick", "handleTodoPagination( $( this ).attr( 'pagenum' ) )" )
					.appendTo( p );
			});
		},
		error: function ( res ) { }
	});
}

/* Pagination Todo List */
function handleTodoPagination( pageNum ) {
	//
	var requestUrl = baseUrl + "/pagination?page=" + pageNum;
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
				createTodoRow( todoObj );
			});
		},
		error: function ( res ) { }
	});
}

/* Check isCompletable and Update Done State */
function checkAndUpdateDoneState( ele ) {
	var itemId = $( ele ).attr( "id" );
	var isCompletable;
	var requestUrl = baseUrl + "/completable/" + itemId;
	$.ajax({
		type: "GET",
		url: requestUrl,
		async: false,
		success: function ( res ) {
			isCompletable = res.data.isCompletable;
		},
		error: function ( res ) { }
	});
	
	if ( isCompletable ) {
		updateDoneState( itemId );
	} else {
		alert( '완료되지 않은 참조 Todo가 있습니다.' );
	}
}

/* Update Done State */
function updateDoneState( itemId ) {
	var requestUrl = baseUrl + "/state/" + itemId;
	$.ajax({
		type: "PUT",
		url: requestUrl,
		async: false,
		success: function ( res ) {
			reloadTodoList();
//			var newItem = $( '<li/>' )
//				.attr( "id", "item" + res.data.itemId );
//			
//			var todoRow = createTodoRow( res.data );
//			
//			var oldItem = $("#item" + itemId );
//			oldItem.replaceWith( newItem );
		},
		error: function ( res ) { }
	});
	
//	reloadTodoList();
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
	
	// Check Box
	var checkBoxAttr = $( '<a/>' )
		.attr( "id", todoObj.itemId )
		.attr( "onclick", "checkAndUpdateDoneState( this )" )
		.addClass( 'todo-completed' )
		.appendTo( todoRow );
	var checkBoxIcon = $( '<i/>' )
		.addClass( 'material-icons toggle-completed-checkbox' )
		.addClass( 'editable' )
		.appendTo( checkBoxAttr );
	
	
	// Task Name
	var todoTitle = $( '<span/>' )
		.addClass( 'todo-title' )
		.text( todoObj.taskName )
		.appendTo( todoRow );
}