var baseUrl = "http://localhost:3333/v1/todos";

$(document).ready( function() {
	//
	$( document ).tooltip();
	reloadTodoList();
	
	$( '.todo-search' ).children( 'input[type=text]' ).hide();
	$( '#search-option' ).val( 'option' );
	
	$( "#search-option" ).change( function () {
		if ( $( this ).val() == 'task_name' ) {
			$( "#input_task_name" ).show();
		} else {
			$( "#input_task_name" ).val( '' );
			$( "#input_task_name" ).hide();
		}
		
		if ( $( this ).val() == 'date' ) {
			$( "[id^=datepicker_]" ).show();
			$( "#datepicker_from" ).datepicker({
				dateFormat: 'yy-mm-dd',
				onSelect: function(dateStr) 
		        {         
		            $( "#datepicker_to" ).val( dateStr );
		            $( "#datepicker_to" ).datepicker( "option",{ minDate: new Date( dateStr ) } )
		        }
				
			}).keyup( function( e ) {
				if( e.keyCode == 8 || e.keyCode == 46 ) {
					$( "#datepicker_from" )._clearDate( this );
				}
			});

			$( "#datepicker_to" ).datepicker({
				dateFormat: 'yy-mm-dd'
			});
			return;
		} else {
			$( "#datepicker_from" ).val('');
			$( "#datepicker_to" ).val('');
			$( "#datepicker_from" ).hide();
			$( "#datepicker_to" ).hide();
		}
	})
});

/* Do Search */
function doSearch() {
	//
	var searchOption = $( "#search-option" ).val();
	var pageNum = 1;
	if( searchOption == 'task_name' ) {
		if( $( "#input_task_name" ).val() == '' ) {
			reloadTodoList();
			return;
		}
		getTodoListBySearchOption( pageNum, searchOption, $( "#input_task_name" ).val(), '' );
	} else if ( searchOption == 'done' || searchOption == 'doing' ) {
		getTodoListBySearchOption( pageNum, searchOption, '', '' );
	} else if ( searchOption == 'date' ) {
		if ( $( "#datepicker_from" ).val() == '' ) {
			alert( 'Input from date to search' );
			return;
		} else if ( $( "#datepicker_to" ).val() == '' ) {
			alert( 'Input to date to search' );
			return;
		}
		getTodoListBySearchOption( pageNum, searchOption, $( "#datepicker_from" ).val(), $( "#datepicker_to" ).val() );
	}
}

/* GET TodoList By SearchOption */
function getTodoListBySearchOption( pn, searchOption, optionValue1, optionValue2 ) {
	//
	var requestUrl = baseUrl + "/pagination?page=" + pn + "&searchOption=" + searchOption;
	
	if ( searchOption == 'date' ) {
		requestUrl += "&fromDate=" + optionValue1 + "&toDate=" + optionValue2;
	} else if ( searchOption == 'task_name' ) {
		requestUrl += "&taskName=" + optionValue1;
	}
	
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
			
			$.each( res.data.pageList, function( i, pageNum ) {
				if ( pageNum == null ) {
					return;
				}
				var p = $( 'div.pagination' )
				var li = $( '<a id="pagnum' + pageNum + '" href="#">' + pageNum + '</a>' )
					.attr( "onclick", "getTodoListBySearchOption( " + pageNum + ", '" + searchOption + "', '" + optionValue1 + "', '" + optionValue2 + "')" )
					.appendTo( p );
				if ( pageNum == pn ) {
					li.addClass( 'active' );
				}
			});
		},
		error: function ( res ) { }
	})
}

/* Handle EnterKey: Create, Update TodoItem Name */
function handleEnterKey(e) {
	//
	if ( e.keyCode === 13 ) {
		e.preventDefault(); // keycode 13 (enter) 이벤트 이외의 별도 브라우저 행동을 막음
		var taskName = document.getElementById( 'taskNameTextField' ).value;
		
		// input field 초기화
		$( "#taskNameTextField" ).val( '' );
		
		// Check if we are editing or not
		var isEditing = $( "#taskNameTextField" ).attr( "isEditing" );
		if ( isEditing ) {
			// Clear editing flag
			$( "#taskNameTextField" ).removeAttr( "isEditing" );
			var itemId = $("#taskNameTextField").attr( "editingItemId" );
			$( "#taskNameTextField" ).removeAttr( "editingItemId" );
			putTodoItem( itemId, taskName );
		} else {
			postTodoItem( taskName );
		}
	}
}

/* PUT Todo Item */
function putTodoItem( itemId, taskName ) {
	//
	var editedItem = {
			itemId: itemId,
			taskName: taskName
	};
	var requestJSON = JSON.stringify( editedItem );
	var requestUrl = baseUrl + "/" + itemId;
	
	$.ajax({
		type: "PUT",
		url: requestUrl,
		async: false,
		headers: {
			"Content-Type": "application/json"
		},
		data: requestJSON,
		success: function ( res ) {
			var pageNum = $( 'div' ).children( '.active' ).text();
			handleTodoPagination( pageNum );
		},
		error: function ( res ) { }
	});
}

/* DELETE Todo Item */
function deleteTodoItem( ele ) {
	//
	var itemId = $( ele ).attr( "id" );
	var requestUrl =  baseUrl + "/" + itemId;
	$.ajax({
		type: "DELETE",
		url: requestUrl,
		async: false,
		success: function ( res ) {
			var pageNum = $( 'div' ).children( '.active' ).text();
			console.log( $( "#search-option" ).val() ); // TANG
			handleTodoPagination( pageNum );
		},
		error: function ( res ) { }
	});
}

/* POST Todo Item */
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
		async: false,
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
			
			$.each( res.data.pageList, function( i, pageNum ) {
				if ( pageNum == null ) {
					return;
				}
				var p = $( 'div.pagination' )
				var li = $( '<a id="pagnum' + pageNum + '" href="#">' + pageNum + '</a>' )
					.attr( "onclick", "handleTodoPagination(" + pageNum + ")" )
					.appendTo( p );
				if ( pageNum == 1 ) {
					li.addClass( 'active' );
				}
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
		async: false,
		headers: {
			"Content-Type": "application/json"
		},
		success: function ( res ) {
			
			if ( res.data.todoList.length == 0 ) {
				handleTodoPagination( pageNum-1 );
				return;
			}
			var cList = $( 'ul.todo-list' );
			cList.empty();
			$.each( res.data.todoList, function( i, todoObj ) {
				createTodoRow( todoObj );
			});
			var p = $( 'div.pagination' );
			p.empty();
			
			$.each( res.data.pageList, function( i, pn ) {
				if ( pn == null ) {
					return;
				}
				var p = $( 'div.pagination' )
				var li = $( '<a id="pagnum' + pn + '" href="#">' + pn + '</a>' )
					.attr( "onclick", "handleTodoPagination(" + pn + ")" )
					.appendTo( p );
				if ( pn == pageNum ) {
					li.addClass( 'active' );
				}
			});
		},
		error: function ( res ) { }
	});
}

/* Pagination Todo List */
//function handleTodoPaginationBySearchOption( pageNum ) {
//	//
//	var requestUrl = baseUrl + "/pagination?page=" + pageNum;
//	$.ajax({
//		type: "GET",
//		url: requestUrl,
//		async: false,
//		headers: {
//			"Content-Type": "application/json"
//		},
//		success: function ( res ) {
//			
//			if ( res.data.todoList.length == 0 ) {
//				handleTodoPagination( pageNum-1 );
//				return;
//			}
//			var cList = $( 'ul.todo-list' );
//			cList.empty();
//			$.each( res.data.todoList, function( i, todoObj ) {
//				createTodoRow( todoObj );
//			});
//			var p = $( 'div.pagination' );
//			p.empty();
//			
//			$.each( res.data.pageList, function( i, pn ) {
//				if ( pn == null ) {
//					return;
//				}
//				var p = $( 'div.pagination' )
//				var li = $( '<a id="pagnum' + pn + '" href="#">' + pn + '</a>' )
//					.attr( "onclick", "handleTodoPagination(" + pn + ")" )
//					.appendTo( p );
//				if ( pn == pageNum ) {
//					li.addClass( 'active' );
//				}
//			});
//		},
//		error: function ( res ) { }
//	});
//}

/* Check isCompletable and Update Done State */
function checkAndUpdateDoneState( ele ) {
	//
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
	//
	var requestUrl = baseUrl + "/state/" + itemId;
	$.ajax({
		type: "PUT",
		url: requestUrl,
		async: false,
		success: function ( res ) {
			var pageNum = $( 'div' ).children( '.active' ).text();
			handleTodoPagination( pageNum );
		},
		error: function ( res ) { }
	});
}

/* Edit Todo Item - Task Name */
function editTodoItem( ele ) {
	//
	var itemId = $( ele ).attr( "id" );
	var listItem = $( "#item" + itemId );
	var titleSpan = listItem.find( "span.todo-title" ).text();
	
	$( "#taskNameTextField" ).val( titleSpan );
	$( "#taskNameTextField" ).attr( "isEditing", true );
	$( "#taskNameTextField" ).attr( "editingItemId", itemId );
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
	
	// Todo Info
	var todoInfo = $( '<span/>' )
		.addClass( 'todo-info' )
		.appendTo( todoRow );
	
	var todoId = $( '<span/>' )
		.text( "[id]" + todoObj.itemId )
		.appendTo( todoInfo );
	
	// Actions
	var todoActions = $( '<span/>' )
		.addClass( 'todo-actions' )
		.appendTo( todoRow );
	
	// Edit Icon
	var editAttr = $( '<a/>' )
		.attr( "id", todoObj.itemId )
		.attr( "onclick", "editTodoItem( this )" )
		.appendTo( todoActions );
	var editIcon = $( '<i/>' )
		.addClass( 'material-icons' )
		.text( 'edit' )
		.attr( "title", "EDIT" )
		.appendTo( editAttr );
	
	// Delete Icon
	var deleteAttr = $( '<a/>' )
		.attr( "id", todoObj.itemId )
		.attr( "onclick", "deleteTodoItem( this )" )
		.appendTo( todoActions );
	var deleteIcon = $( '<i/>' )
		.addClass( 'material-icons' )
		.text( 'delete' )
		.attr( "title", "DELETE" )
		.appendTo( deleteAttr );
}