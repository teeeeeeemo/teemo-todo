package com.teemo.hyun.v1.controller;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.teemo.hyun.v1.common.advice.exception.CBadRequestException;
import com.teemo.hyun.v1.common.constant.CommonConstant;
import com.teemo.hyun.v1.entity.TodoItem;
import com.teemo.hyun.v1.entity.TodoItemChild;
import com.teemo.hyun.v1.model.CommonResponse;
import com.teemo.hyun.v1.service.TodoService;

@RestController
@RequestMapping( value = "/v1/todos" )
public class TodoController {

	private static final Logger logger = LoggerFactory.getLogger( TodoController.class );
	
	@Autowired
	private TodoService todoService;
	
	/* Post Todo Item */
	@PostMapping( value = "" )
	public ResponseEntity< CommonResponse > createTodoItem( @RequestBody TodoItem item ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		if ( StringUtils.isAllEmpty( item.getTaskName() ) ) {
			throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST );
		}
		
		item.setIsDone( false );
		TodoItem savedItem = todoService.saveTodoItem( item );
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( savedItem )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* 
	 * Post Todo Item Child 
	 *	- 1. parentId와 childId 같지 않아야 함.
	 *	- 2. 유효하지 않은 childId는 추가 불가.
	 *	- 3. parentId: 1, childId: 2
	 *		 parentId: 2, childId: 1 과 같은 케이스 불가.
	 *	- 4. parent -> child는 Only 1depth ( * 1->2->3-> ... -> n -> 1 .... 는 불가. ) 
	 */
	@PostMapping( value = "/add-child/{parentId}" )
	public ResponseEntity< CommonResponse > createTodoItemChild( @PathVariable Long parentId,
																 @RequestBody TodoItemChild itemChild ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		if ( parentId.equals( itemChild.getChildId() ) ) {
			throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_CHILD_ID );
		}
		
		TodoItem itemParent = todoService.getTodoItemOne( parentId );
		itemChild.setTodoItem( itemParent );
		itemChild.setParentId( parentId );
		
		if( todoService.checkTodoChildIsAddable( parentId, itemChild.getChildId() ) ) {	
			todoService.saveTodoItemChild( itemChild );
		}

		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( itemChild )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/*
	 * Get Todo List With Pagination
	 */
	@GetMapping( value = "/pagination" )
	public ResponseEntity< CommonResponse > getTodoItemListWithPagination( @RequestParam( value = "page", defaultValue = "1", required = false ) Integer pageNum,
																		   @RequestParam( value = "searchOption", required = false ) String searchOption, 
																		   @RequestParam( value = "taskName", required = false ) String taskName,
																		   @RequestParam( value = "fromDate", required = false ) String fromDate, 
																		   @RequestParam( value = "toDate", required = false ) String toDate ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );

		Map< String, Object > resultMap = new HashMap<>();
		Integer[] pageList = null;
		
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( null )
													  .build();
		
		if ( !StringUtils.isAllEmpty( searchOption ) ) {
			String searchType = searchOption;
			
			switch( searchType ) {
				
				case "task_name": 
					if ( StringUtils.isAllEmpty( taskName ) ) {
						throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_TASK_NAME );
					}
					pageList = todoService.getTodoPageListByTaskName( pageNum, "%" + taskName + "%" );
					List< TodoItem > todoListByTaskName = todoService.getTodoListPaginationByTaskName( pageNum, "%" + taskName + "%" );
					
					resultMap.put( "pageList", pageList );
					resultMap.put( "todoList", todoListByTaskName );
					commonResponse.setData( resultMap );
					
					return ResponseEntity.ok( commonResponse );
				
				case "date":
					if ( StringUtils.isAllEmpty( fromDate ) || StringUtils.isAllEmpty( toDate ) ) {
						throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_DATE );
					}
					fromDate += CommonConstant.Todo.FROM_DATE_TIME;
					toDate   += CommonConstant.Todo.TO_DATE_TIME;
					SimpleDateFormat dateFormat = new SimpleDateFormat( CommonConstant.Todo.DATE_FORMAT );
					dateFormat.setLenient( false );
					
					Date parsedFromDate = null;
					Date parsedToDate = null;
					try {
						parsedFromDate = dateFormat.parse( fromDate );
						parsedToDate = dateFormat.parse( toDate );
						
						if ( ( parsedFromDate == null ) || 
							 ( parsedToDate   == null ) ) { 
							throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_DATE );
						} else if ( parsedFromDate.getTime() > parsedToDate.getTime() ) {
							throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_DATE );
						}
						
					} catch ( ParseException e ) {
						throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_DATE );
					}
					
					pageList = todoService.getTodoPageListBetweenDate( pageNum, parsedFromDate, parsedToDate );
					List< TodoItem > todoListBetweenDate = todoService.getTodoListPaginationBetweenDate( pageNum, parsedFromDate, parsedToDate );
					
					resultMap.put( "pageList", pageList );
					resultMap.put( "todoList", todoListBetweenDate );
					commonResponse.setData( resultMap );
					
					return ResponseEntity.ok( commonResponse );
					
				case "done":
					pageList = todoService.getTodoPageListByIsDone( pageNum, true );
					List< TodoItem > todoListByDone = todoService.getTodoListPaginationByIsDone( pageNum, true );
					resultMap.put( "pageList", pageList );
					resultMap.put( "todoList", todoListByDone );
					commonResponse.setData( resultMap );
					
					return ResponseEntity.ok( commonResponse );
					
				case "doing":
					pageList = todoService.getTodoPageListByIsDone( pageNum, false );
					List< TodoItem > todoListByDoing = todoService.getTodoListPaginationByIsDone( pageNum, false );
					resultMap.put( "pageList", pageList );
					resultMap.put( "todoList", todoListByDoing );
					commonResponse.setData( resultMap );
					
					return ResponseEntity.ok( commonResponse );
			}
		}
		pageList = todoService.getTodoPageListTotal( pageNum );
		List< TodoItem > todoList = todoService.getTodoListPagination( pageNum );
		logger.debug( "######### Pages: " + Arrays.toString( pageList ) );
		
		resultMap.put( "pageList", pageList );
		resultMap.put( "todoList", todoList );
		
		commonResponse.setData( resultMap );
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* 
	 * Get Todo List 
	 * 	- Sort by DESC, "createdAt"
	 */
	@GetMapping( value = "" ) 
	public ResponseEntity< CommonResponse > getTodoItemList( ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		List< TodoItem > todoList = todoService.getTodoListSortByCreatedAtDesc();
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( todoList )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* Get Todo List For Add Child */ 
	@GetMapping( value = "/add-child/{parentId}")
	public ResponseEntity< CommonResponse > getTodoListForAdd( @PathVariable Long parentId ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		List< TodoItem > todoListForAdd = todoService.getTodoListForAdd( parentId );
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( todoListForAdd )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* Get Todo List For Remove Child */ 
	@GetMapping( value = "/remove-child/{parentId}")
	public ResponseEntity< CommonResponse > getTodoListForRemove( @PathVariable Long parentId ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		List< TodoItem > todoListForRemove = todoService.getTodoListForRemove( parentId );
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( todoListForRemove )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* Get Todo Item One */
	@GetMapping( value = "/{itemId}" )
	public ResponseEntity< CommonResponse > getTodoItemOne( @PathVariable Long itemId ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		TodoItem todoItem = todoService.getTodoItemOne( itemId );
		
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data(todoItem)
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );

	}
	
	/* Update Todo Item */
	@PutMapping( value = "/{itemId}" )
	public ResponseEntity< CommonResponse > updateTodoItem( @PathVariable Long itemId, 
															@RequestBody TodoItem todoItem ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );

		TodoItem updatedItem = todoService.updateTodoItem( itemId, todoItem );
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( updatedItem )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );

	}
	
	/* Update Todo Item State */
	@PutMapping( value = "/state/{itemId}" )
	public ResponseEntity< CommonResponse > updateTodoItemState( @PathVariable Long itemId, @RequestBody( required = false ) TodoItem todoItem ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );

		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .build();
		TodoItem updatedItem = null;
		if( todoItem != null && todoItem.getIsDone() != null ) {
			updatedItem = todoService.updateTodoItemStateByClient( itemId, todoItem.getIsDone() );
		} else {
			updatedItem = todoService.updateTodoItemState( itemId );
		}
		commonResponse.setData( updatedItem );
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );

	}
	
	/* Delete Todo Item */
	@DeleteMapping( value = "/{itemId}" )
	public ResponseEntity< CommonResponse > deleteTodoItem( @PathVariable Long itemId ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );

		CommonResponse commonResponse = CommonResponse.builder()
												      .code( CommonConstant.Common.SUCCESS_CODE )
												      .message( CommonConstant.Common.SUCCESS_MESSAGE )
												      .data( null )
												      .build();
		
		todoService.deleteTodoItem( itemId );
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* Delete Todo Item Child */
	@DeleteMapping( value = "/remove-child/{parentId}" )
	public ResponseEntity< CommonResponse > deleteTodoItemChild( @PathVariable Long parentId, 
																 @RequestBody TodoItemChild itemChild ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		CommonResponse commonResponse = CommonResponse.builder()
												      .code( CommonConstant.Common.SUCCESS_CODE )
												      .message( CommonConstant.Common.SUCCESS_MESSAGE )
												      .data( null )
												      .build();
		
		if ( parentId.equals( itemChild.getChildId() ) ) {
			throw new CBadRequestException( CommonConstant.Todo.BAD_REQUEST_CHILD_ID );
		}
		
		todoService.deleteTodoItemChild( parentId, itemChild.getChildId() );
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
	/* Get Todo Item isCompletable */
	@GetMapping( value = "/completable/{parentId}" )
	public ResponseEntity< CommonResponse > getTodoItemIsCompletable( @PathVariable Long parentId  ) {
		//
		logger.debug( "# START # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		
		TodoItem todoItem = todoService.checkTodoItemIsCompletable( parentId );

		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.SUCCESS_CODE )
													  .message( CommonConstant.Common.SUCCESS_MESSAGE )
													  .data( todoItem )
													  .build();
		
		logger.debug( "#  END  # " + new Object() {}.getClass().getEnclosingMethod().getName() + " ------------------------------------------------------------" );
		return ResponseEntity.ok( commonResponse );
	}
	
}