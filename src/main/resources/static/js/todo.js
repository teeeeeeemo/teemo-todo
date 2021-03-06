var baseUrl = "http://localhost:3333/v1/todos";

$(document).ready( function() {
	//
	$( document ).tooltip();
	reloadTodoList();
	
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

/* Do Sort */
function doSort( sortDirection ) {
	//
	if( sortDirection == 'asc' ) {
		$( "#asc" ).addClass( "active" );
		$( "#desc" ).removeClass( "active" );
	} else {
		$( "#desc" ).addClass( "active" );
		$( "#asc" ).removeClass( "active" );
	}
	getTodoList( 1 );
}

/* Init Search Option */
function initSearchOption() {
	//
	$( '.todo-search' ).children( 'input[type=text]' ).hide();
	$( '#search-option' ).val( 'option' );
	$( '.todo-search' ).children( 'input[type=text]' ).hide();
	$( "#input_task_name" ).val( '' );
	$( "datepicker_from" ).val( '' );
	$( "datepicker_to" ).val( '' );
}

/* Do Search */
function doSearch( sortDirection, sortOption ) {
	//
	var searchOption = $( "#search-option" ).val();
	if ( searchOption == 'option' ) {
		alert( 'Select Search Option' );
	}
	getTodoList( 1 );
}

/* GET TodoList NEW */
function getTodoList( pn ) {
	//
	var requestUrl = baseUrl + "/pagination?page=" + pn;
	var searchOption = $( "#search-option" ).val();
	
	if ( searchOption != 'option' ) {
		requestUrl += "&searchOption=" + searchOption;
		if( searchOption == 'task_name' && $( "#input_task_name" ).val() == '' ) {
			requestUrl = baseUrl + "/pagination?page=" +pn;
		} else if ( searchOption == 'task_name' ) {
			requestUrl += "&taskName=" + $( "#input_task_name" ).val();
		} else if ( searchOption == 'date' ) {
			requestUrl += "&fromDate=" + $( "#datepicker_from" ).val() + "&toDate=" + $( "#datepicker_to" ).val();
		} 
	}
	
	requestUrl += "&sortDirection=" + $( '.todo-sort' ).children( '.active' ).attr( 'id' );
	requestUrl += "&sortOption=" + $( "#sort-option" ).val();
	
	$.ajax({
		type: "GET",
		url: requestUrl,
		headers: {
			"Content-Type": "application/json"
		},
		success: function ( res ) {
			if ( res.data.todoList.length == 0 && pn > 1) {
				getTodoList( pn-1 );
				return;
			}
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
				
				var total = res.data.pageList.length;
				var p = $( 'div.pagination' );
				
				if ( i == 0 ) {
					var firstAttr = $( '<a/>' )
					.attr( "onclick", "getTodoList( " + 1 + " )" )
					.addClass( 'select-page' )
					.attr( "title", "FirstPage" )
					.appendTo( p );
					var firstIcon = $( '<i/>' )
					.addClass( 'material-icons' )
					.text( 'first_page' )
					.appendTo( firstAttr );
				}

				var li = $( '<a id="pagnum' + pageNum + '" href="#">' + pageNum + '</a>' )
					.attr( "onclick", "getTodoList( " + pageNum + " ) "  )
					.appendTo( p );
				if ( pageNum == pn ) {
					li.addClass( 'active' );
				}
				
				if ( i == total - 1 ) {
					var lastAttr = $( '<a/>' )
					.attr( "onclick", "getTodoList( " + res.data.lastPage + " )" )
					.addClass( 'select-page' )
					.attr( "title", "LastPage" )
					.appendTo( p );
					var lastIcon = $( '<i/>' )
					.addClass( 'material-icons' )
					.text( 'last_page' )
					.appendTo( lastAttr );
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

/* GET Todo List For Add */
function getTodoListForAdd( ele ) {
	//
	var modal = $( "#todo-modal" );
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];
	// When the user clicks the button, open the modal 
	modal.css( "display", "block" );
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.css( "display", "none" );
	}
	
	window.onclick = function( event ) {
		if ( event.target == modal ) {
			modal.style.display = "none";
		}
		
		if ( event.target.textContent == 'add' ) {
			var parentTodo = event.target.parentNode.id;
			if ( typeof parentTodo == "undefined" 
				 || parentTodo == null
				 || parentTodo == "" ) {
				parentTodo = event.target.id;
			}
			var requestUrl =  baseUrl + "/add-child/" + parentTodo;
			$.ajax({
				type: "GET",
				async: false,
				url: requestUrl,
				headers: {
					"Content-Type": "application/json"
				},
				async: false,
				success: function ( res ) {
					
					if ( res.data.isChild ) {
						alert( 'Cannot be add - This is Child Todo' );
						modal.css( "display", "none" );
					} else if ( res.data.length == 0 ) {
						alert( 'Cannot be add - No Child Todos to add' );
						modal.css( "display", "none" );
					} else {
						var cList = $( 'ul.task-list' );
						cList.empty();
						$.each( res.data, function( i, todoObj ) {
							createTaskRowForAdd( todoObj, parentTodo );
						});
					}
					
				},
				error: function ( res ) { }
			});
			
		}
	}
}

/* Get Todo List For Remove */
function getTodoListForRemove( ele ) {
	//
	var modal = $( "#todo-modal" );
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName( "close" )[0];
	modal.css( "display", "block" )
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.css( "display", "none" );
	}
	
	window.onclick = function( event ) {
		if ( event.target == modal ) {
			modal.style.display = "none";
		}
		
		if ( event.target.textContent == 'remove' ) {
			var parentTodo = event.target.parentNode.id;
			if ( typeof parentTodo == "undefined" 
				 || parentTodo == null
				 || parentTodo == "" ) {
				parentTodo = event.target.id;
			}
			var requestUrl =  baseUrl + "/remove-child/" + parentTodo;
			$.ajax({
				type: "GET",
				async: false,
				url: requestUrl,
				headers: {
					"Content-Type": "application/json"
				},
				async: false,
				success: function ( res ) {
					
					if ( res.data.length == 0 ) {
						alert( 'No Added Reference Todo' );
						modal.css( "display", "none" );
					} else {
						var cList = $( 'ul.task-list' );
						cList.empty();
						$.each( res.data, function( i, todoObj ) {
							createTaskRowForRemove( todoObj, parentTodo );
						});
					}
					
				},
				error: function ( res ) { }
			});
			
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
			getTodoList( pageNum );
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
			getTodoList( pageNum );
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
	initSearchOption();
	$( "#desc" ).addClass( "active" );
	$( "#asc" ).removeClass( "active" );
	getTodoList( 1 );
}

function reloadTodoListWithOptions() {
	//
	var pageNum = $( 'div' ).children( '.active' ).text();
	getTodoList( pageNum );
}

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
	if ( isCompletable || isCompletable == undefined ) {
		updateDoneState( itemId );
	} else {
		alert( 'Some things have not been completed' );
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
			if ( res.data.isChild && res.data.isDone ) {
				alert( 'Cannot be changed - With Parents' )
			}
			var pageNum = $( 'div' ).children( '.active' ).text();
			getTodoList( pageNum );
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

/* Delete Todo Child */
function deleteTodoChild( childId, parentId ) {
    var childItem = {
    		childId: childId
    };
    var requestJSON = JSON.stringify(childItem);
    var requestUrl = baseUrl + "/remove-child/" + parentId;
    $.ajax({
    	data: requestJSON,
    	headers: {
            "Content-Type": "application/json"
        },
        type: "DELETE",
        url: requestUrl,
        async: false,
        success: function ( res ) {
        	var oldItem = $("#child-item" + childId);
            cuteHide(oldItem);
            oldItem.remove();
        },
        error: function (data) { }
    });
    
    reloadTodoListWithOptions();
}

/* Create Todo Child */
function createTodoChild( childId, parentId ) {
	var isAdded;
    var childItem = {
    		childId: childId
    };
    var requestJSON = JSON.stringify(childItem);
    var requestUrl = baseUrl + "/add-child/" + parentId;
    $.ajax({
    	data: requestJSON,
    	headers: {
            "Content-Type": "application/json"
        },
        type: "POST",
        url: requestUrl,
        async: false,
        success: function ( res ) {
        	var oldItem = $("#child-item" + res.data.childId);
            cuteHide(oldItem);
            oldItem.remove();
//            changeIsDone = data.isDone;
        	isAdded = true;
        },
        error: function (data) { }
    });
    
    if( isAdded ) {
    	var itemId = parentId; // get the item id!
        var requestJSON = JSON.stringify();
        var isCompletable;
        var doneState;
        requestUrl = baseUrl + "/completable/" + parentId;
        /* 참조하고 있는 모든 자식 Todo Item들의 완료 여부 확인 */
        $.ajax({
            type: "GET",
            url: requestUrl,
            async: false,
            success: function ( res ) {
            	isCompletable = res.data.isCompletable;
            	doneState = res.data.isDone;
            },
            error: function ( res ) { }
        });
        if ( !isCompletable && doneState ) {
        	requestUrl = baseUrl + "/state/" + parentId;
        	var todoItem = {
            		isDone: false
            };
            var requestJSON = JSON.stringify( todoItem );
        	$.ajax({
                type: "PUT",
                url: requestUrl,
                async: false,
                success: function ( res ) {
                	// Create new list item                        
                    var newListItem = $('<li/>')
                        .attr("id", "item" + res.data.itemId);
                    
                    if (res.data.isDone) {
                        newListItem.addClass('completed')
                    }
                    var todoRow = createTodoRow( res.data );
                    
                    // Replace the old one by the new one
                    var oldListItem = $("#item" + parentId);
                    oldListItem.replaceWith(newListItem);
                },
                error: function ( res ) { }
            });
        }
    	
    }
    reloadTodoListWithOptions();
}

/* Create Task Row For Add */
function createTaskRowForAdd( todoObj, parentTodo ) {
	//
	var cList = $( 'ul.task-list' );
    var li = $( '<li/>' )
        .attr( "id", "child-item" + todoObj.itemId )
        .appendTo( cList );
    var todoRow = $( '<div/>' )
    	.addClass( 'todo-row' )
    	.appendTo( li );
    
    if ( todoObj.isDone ) {
    	li.addClass( 'completed' )
    }
    
    // Actions
	var todoActions = $( '<span/>' )
		.addClass( 'todo-actions' )
		.appendTo( todoRow );
    
    // Add Icon
    var addAttr = $('<a/>')
        .attr( "id", todoObj.itemId ) // to know item id!
        .attr( "onclick", "createTodoChild" + "(" + todoObj.itemId + "," + parentTodo + ")" )
        .addClass(' todo-added' )
        .appendTo( todoActions );

    var addIcon = $( '<i/>' )
        .addClass( 'material-icons' )
        .text( 'add_circle' )
        .addClass( 'editable' )
        .appendTo( addAttr );
    
    setModalTodoInfo( todoRow, todoObj );
 	
}

/* Create Task Row For Remove */
function createTaskRowForRemove( todoObj, parentTodo ) {
	//
	var cList = $( 'ul.task-list' );
    var li = $( '<li/>' )
        .attr( "id", "child-item" + todoObj.itemId )
        .appendTo( cList );
    var todoRow = $( '<div/>' )
    	.addClass( 'todo-row' )
    	.appendTo( li );
    
    if ( todoObj.isDone ) {
    	li.addClass( 'completed' )
    }
    
    // Actions
	var todoActions = $( '<span/>' )
		.addClass( 'todo-actions' )
		.appendTo( todoRow );
    
    // Add Icon
    var addAttr = $('<a/>')
        .attr( "id", todoObj.itemId ) // to know item id!
        .attr( "onclick", "deleteTodoChild" + "(" + todoObj.itemId + "," + parentTodo + ")" )
        .addClass(' todo-added' )
        .appendTo( todoActions );

    var addIcon = $( '<i/>' )
        .addClass( 'material-icons' )
        .text( 'remove_circle' )
        .addClass( 'editable' )
        .appendTo( addAttr );
    
    setModalTodoInfo( todoRow, todoObj );
 	
}

/* Set Modal Todo Info */
function setModalTodoInfo( todoRow, todoObj ) {
	//
    // Todo Info
	var todoInfo = $( '<span/>' )
		.addClass( 'modal-todo-info' )
		.appendTo( todoRow );
	
	// Todo Id
	var todoIdIcon = $( '<span/>' )
		.addClass( 'material-icons' )
		.text( 'info' )
		.attr( "title", "ITEM ID" )
		.appendTo( todoInfo );
	var todoId = $( '<span/>' )
		.attr( "id", "item" + todoObj.itemId )
		.text( todoObj.itemId )
		.appendTo( todoInfo );
	
	// Task Name
    var todoTitle = $( '<span/>' )
        .addClass( 'todo-modal-title' )
        .text( todoObj.taskName )
        .appendTo( todoRow );
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
	
	// Todo Child
	if( todoObj.todoChildList.length > 0 ) {
    	
    	var todoChild = $( '<span/>' )
    		.addClass( 'todo-child' )
    		.appendTo( todoTitle );
    	
    	$.each( todoObj.todoChildList, function( i, item ) {
    		
    		var childId = $( '<span/>' )
    			.text( "@" + item.childId )
    			.appendTo( todoChild );
    		
            requestUrl = baseUrl + "/" + item.childId;
            $.ajax({
                type: "GET",
                url: requestUrl,
                async: false,
                success: function ( res ) {
                	if ( res.data.isDone ) {
            			childId.addClass( 'todo-child-completed' );
            		}
                	childId.attr( "title", res.data.taskName );
                },
                error: function ( res ) { }
            });
            
    	});
    		
    }
	
	// Todo Id
	var todoId = $( '<span/>' )
		.addClass( 'todo-id' )
		.appendTo( todoRow );
	
	// Todo Id
	var todoIdIcon = $( '<span/>' )
		.addClass( 'material-icons' )
		.text( 'info' )
		.attr( "title", "ITEM ID" )
		.appendTo( todoId );
	var todoId = $( '<span/>' )
		.attr( "id", "item" + todoObj.itemId )
		.text( todoObj.itemId )
		.appendTo( todoId );
	
	// Todo Info
	var todoInfo = $( '<span/>' )
		.addClass( 'todo-info' )
		.appendTo( todoId );
	
	// CreatedAt
 	var d = todoObj.createdAt;
    var updatedAt = $( '<span/>' )
    	.addClass( 'todo-info' )
        .text(moment(d).format('YYYY-MM-DD'))
        .attr( "title", "CreatedAt" )
        .appendTo( todoInfo );
    
 	// UpdatedAt
 	var d = todoObj.updatedAt;
    var updatedAt = $( '<span/>' )
    	.addClass( 'todo-info' )
        .text(moment(d).format( 'YYYY-MM-DD' ))
        .attr( "title", "UpdatedAt" )
        .appendTo( todoInfo );
	
	// Actions
	var todoActions = $( '<span/>' )
		.addClass( 'todo-actions' )
		.appendTo( todoRow );
	
	// Add Child Icon
	var addAttr = $( '<a/>' )
		.attr( "id", todoObj.itemId )
		.attr( "onclick", "getTodoListForAdd( this )" )
		.appendTo( todoActions );
	var addIcon = $( '<i/>' )
		.addClass( 'material-icons' )
		.text( 'add' )
		.attr( "title", "ADD-ReferenceTodo" )
		.appendTo( addAttr );
	
	// Remove Child Icon
	var removeAttr = $( '<a/>' )
		.attr( "id", todoObj.itemId )
		.attr( "onclick", "getTodoListForRemove( this )" )
		.appendTo( todoActions );
	var removeIcon = $( '<i/>' )
		.addClass( 'material-icons' )
		.text( 'remove' )
		.attr( "title", "REMOVE-ReferenceTodo" )
		.appendTo( removeAttr );
	
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

/* For animation When Deleting */ 
function cuteHide(el) {
	el.animate({ opacity: '0' }, 300, function () {
		el.animate({ height: '0px' }, 300, function () {
			el.remove();
		});
	});
}