var baseUrl = "http://localhost:3333/v1/todos";

$(document).ready( function() {
	//
	$( document ).tooltip();
	reloadTodoList();
	initSearchOption();
	
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
			if ( res.data.todoList.length == 0 ) {
				getTodoListBySearchOption( pn-1, searchOption, optionValue1, optionValue2 );
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

/* GET Todo List For Add */
function getTodoListForAdd( ele ) {
	//
//	var modal = document.getElementById("todo-modal");
	var modal = $( "#todo-modal" );
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];
	// When the user clicks the button, open the modal 
//	modal.style.display = "block";
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
			console.log( parentTodo );
			if ( typeof parentTodo == "undefined" 
				 || parentTodo == null
				 || parentTodo == "" ) {
				parentTodo = event.target.id;
			}
			var requestUrl =  baseUrl + "/add-child/" + parentTodo;
			console.log( requestUrl );
			$.ajax({
				type: "GET",
				async: false,
				url: requestUrl,
				headers: {
					"Content-Type": "application/json"
				},
				async: false,
				success: function ( res ) {
                    var cList = $( 'ul.task-list' );
                    cList.empty();
                    $.each( res.data, function( i, todoObj ) {
                        createTaskRowForAdd( todoObj, parentTodo );
                    });
				},
				error: function ( res ) { }
			});
			
		}
	}
}

/* Get Todo List For Remove */
function getTodoListForRemove( ele ) {
	//
	var modal = document.getElementById( "todo-modal" );
	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName( "close" )[0];
	// When the user clicks the button, open the modal 
	modal.style.display = "block";
	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
	  modal.style.display = "none";
	}
	
	window.onclick = function( event ) {
		if ( event.target == modal ) {
			modal.style.display = "none";
		}
		
		if ( event.target.textContent == 'remove' ) {
			var parentTodo = event.target.parentNode.id;
			console.log( parentTodo );
			if ( typeof parentTodo == "undefined" 
				 || parentTodo == null
				 || parentTodo == "" ) {
				parentTodo = event.target.id;
			}
			var requestUrl =  baseUrl + "/remove-child/" + parentTodo;
			console.log( requestUrl );
			$.ajax({
				type: "GET",
				async: false,
				url: requestUrl,
				headers: {
					"Content-Type": "application/json"
				},
				async: false,
				success: function ( res ) {
                    var cList = $( 'ul.task-list' );
                    cList.empty();
                    $.each( res.data, function( i, todoObj ) {
                        createTaskRowForAdd( todoObj, parentTodo );
                    });
				},
				error: function ( res ) { }
			});
			
		}
	}
}

/* Create Todo Children */
function createTodoChildren(childId, parentId) {
	var isAdded;
    var childItem = {
            parentId: parentId,
            childId: childId
        };
    var requestJSON = JSON.stringify(childItem);
    $.ajax({
    	data: requestJSON,
    	headers: {
            "Content-Type": "application/json"
        },
        type: "PUT",
        url: "http://localhost:3030/v1/todo/add-child/" + parentId,
        async: false,
        success: function (data) {
        	isAdded = true;
        	console.log( "RESPONSE_DATA:" + data.isDone );
        	var oldItem = $("#child-item" + childId);
            cuteHide(oldItem);
            oldItem.remove();
        },
        error: function (data) { }
    });
    
    if ( isAdded ) {
    	var itemId = parentId; // get the item id!
        var requestJSON = JSON.stringify();
        var isCompletable;
        requestUrl = 
        
        /* 참조하고 있는 모든 자식 Todo Item들의 완료 여부 확인 */
        $.ajax({
            type: "GET",
            url: "http://localhost:3030/v1/todo/item/completable/" + itemId,
            async: false,
            success: function (data) {
            	isCompletable = data.isCompletable;
            },
            error: function (data) { }
        });
    	
        if ( isCompletable ) {
        	$.ajax({
                type: "PUT",
                url: "http://localhost:3030/v1/todo/state/" + parentId,
                async: false,
                success: function (data) {
                	// Create new list item                        
                    var newListItem = $('<li/>')
                        .attr("id", "item" + data.parentId);
                    
                    if (data.isDone) {
                        newListItem.addClass('completed')
                    }
                    var todoRow = createTodoRow(newListItem, data);
                    
                    // Replace the old one by the new one
                    var oldListItem = $("#item" + parentId);
                    oldListItem.replaceWith(newListItem);
                },
                error: function (data) { }
            });
        }
    }
    
    reloadTodoList();
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
			var searchOption = $( "#search-option" ).val();
			var optionValue1 = '';
			var optionValue2 = '';
			if ( searchOption == 'option' ) {
				handleTodoPagination( pageNum );
			} else {
				if( searchOption == 'task_name' ) {
					optionValue1 = $( "#input_task_name" ).val();
				} else if ( searchOption == 'date' ) {
					optionValue1 = $( "datepicker_from" ).val();
					optionValue2 = $( "datepicker_to" ).val();
				} 
				getTodoListBySearchOption( pageNum, searchOption, optionValue1, optionValue2 );
			}
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
			var searchOption = $( "#search-option" ).val();
			var optionValue1 = '';
			var optionValue2 = '';
			if ( searchOption == 'option' ) {
				handleTodoPagination( pageNum );
			} else {
				if( searchOption == 'task_name' ) {
					optionValue1 = $( "#input_task_name" ).val();
				} else if ( searchOption == 'date' ) {
					optionValue1 = $( "datepicker_from" ).val();
					optionValue2 = $( "datepicker_to" ).val();
				} 
				getTodoListBySearchOption( pageNum, searchOption, optionValue1, optionValue2 );
			}
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
			var searchOption = $( "#search-option" ).val();
			var optionValue1 = '';
			var optionValue2 = '';
			if ( searchOption == 'option' ) {
				handleTodoPagination( pageNum );
			} else {
				if( searchOption == 'task_name' ) {
					optionValue1 = $( "#input_task_name" ).val();
				} else if ( searchOption == 'date' ) {
					optionValue1 = $( "datepicker_from" ).val();
					optionValue2 = $( "datepicker_to" ).val();
				} 
				getTodoListBySearchOption( pageNum, searchOption, optionValue1, optionValue2 );
			}
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

/* Create Todo Child */
function createTodoChild( childId, parentId ) {
	var changeIsDone;
    var childItem = {
    		childId: childId
    };
    var requestJSON = JSON.stringify(childItem);
    var requestUrl = baseUrl + "/" + parentId;
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
            changeIsDone = data.isDone;
        },
        error: function (data) { }
    });
    
    console.log("!!!changeIsDone: " + changeIsDone);
    if( changeIsDone ) {
    	var itemId = parentId; // get the item id!
        var requestJSON = JSON.stringify();
        var isCompletable;
        
        /* 참조하고 있는 모든 자식 Todo Item들의 완료 여부 확인 */
        $.ajax({
            type: "GET",
            url: "http://localhost:3030/v1/todo/item/completable/" + itemId,
            async: false,
            success: function (data) {
            	isCompletable = data.isCompletable;
            },
            error: function (data) { }
        });
    	
        if ( isCompletable ) {
        	$.ajax({
                type: "PUT",
                url: "http://localhost:3030/v1/todo/state/" + parentId,
                async: false,
                success: function (data) {
                	// Create new list item                        
                    var newListItem = $('<li/>')
                        .attr("id", "item" + data.parentId);
                    
                    if (data.isDone) {
                        newListItem.addClass('completed')
                    }
                    var todoRow = createTodoRow(newListItem, data);
                    
                    // Replace the old one by the new one
                    var oldListItem = $("#item" + parentId);
                    oldListItem.replaceWith(newListItem);
                },
                error: function (data) { }
            });
        }
    	
    }
    reloadTodoList();
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
    
    // Add Icon
    var addAttr = $('<a/>')
        .attr( "id", todoObj.itemId ) // to know item id!
        .attr( "onclick", "createTodoChild" + "(" + todoObj.itemId + "," + parentTodo + ")" )
        .addClass(' todo-added' )
        .appendTo( todoRow );

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
    
    // Add Icon
    var addAttr = $('<a/>')
        .attr( "id", todoObj.itemId ) // to know item id!
        .attr( "onclick", "createTodoChildren" + "(" + todoObj.itemId + "," + parentTodo + ")" )
        .addClass(' todo-added' )
        .appendTo( todoRow );

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
    // Task Name
    var todoTitle = $( '<span/>' )
        .addClass( 'todo-title' )
        .text( todoObj.taskName )
        .appendTo( todoRow );
    
    // Todo Info
	var todoInfo = $( '<span/>' )
		.addClass( 'todo-info' )
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
    
 	// UpdatedAt
 	var d = todoObj.updatedAt;
    var updatedAt = $( '<span/>' )
    	.addClass( 'todo-date' )
        .text( moment(d).format( 'YYYY-MM-DD' ) )
        .appendTo( todoInfo );
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