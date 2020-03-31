package com.teemo.hyun.v1.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.teemo.hyun.v1.common.advice.exception.CNotFoundException;
import com.teemo.hyun.v1.common.constant.CommonConstant;
import com.teemo.hyun.v1.entity.TodoItem;
import com.teemo.hyun.v1.entity.TodoItemChild;
import com.teemo.hyun.v1.repository.TodoItemChildRepository;
import com.teemo.hyun.v1.repository.TodoItemRepository;

@Service
public class TodoService {

	@Autowired
	private TodoItemRepository todoItemRepository;
	
	@Autowired
	private TodoItemChildRepository todoItemChildRepository;
	
	private static final int BLOCK_PAGE_NUM_COUNT = 10;
	private static final int PAGE_POST_COUNT = 8; // 8 item per 1 page 
	
	/* Todo Item 추가 */
	public TodoItem saveTodoItem( TodoItem todoItem ) {
		//
		return todoItemRepository.save( todoItem );
	}
	
	/* Todo Item Child 추가 */
	public TodoItemChild saveTodoItemChild( TodoItemChild todoItemChild ) {
		//
		return todoItemChildRepository.save( todoItemChild );
	}
	
	/* Todo List 조회 */
	public List< TodoItem > getTodoList( ) {
		//
		return todoItemRepository.findAll();
	}
	
	/* 
	 * Todo List 조회 
	 * 	- Sort by "createdAt" ( DESC )
	 */
	public List< TodoItem > getTodoListSortByCreatedAtDesc( ) {
		//
		return todoItemRepository.findAll( Sort.by( Sort.Direction.DESC, "createdAt" ) );
	}
	
	/* Todo List 조회 
	 *  - Pagination 
	 */
	public List< TodoItem > getTodoListPagination( Integer pageNum ) {
		//
		Page< TodoItem > page = todoItemRepository.findAll( PageRequest.of( pageNum-1, PAGE_POST_COUNT, Sort.by( Sort.Direction.DESC, "createdAt" ) ) );
		List< TodoItem > todoList = page.getContent();
		List< TodoItem > todoItemList = new ArrayList<>();
		
		for ( TodoItem todoItem: todoList ) {
			todoItemList.add( todoItem );
		}
		return todoItemList;
	}
	
	/* Todo List 조회 
	 *  - Pagination 
	 *  - By TaskName
	 */
	public List< TodoItem > getTodoListPaginationByTaskName( Integer pageNum, String taskName ) {
		//
		Page< TodoItem > page = todoItemRepository.findAllByTaskNameLike( PageRequest.of( pageNum-1, PAGE_POST_COUNT, Sort.by( Sort.Direction.DESC, "createdAt" ) ), taskName );
		List< TodoItem > todoList = page.getContent();
		List< TodoItem > todoItemList = new ArrayList<>();
		
		for ( TodoItem todoItem: todoList ) {
			todoItemList.add( todoItem );
		}
		return todoItemList;
	}
	
	/* 
	 * Todo List 조회 
	 *  - Pagination 
	 *  - Between FromDate & ToDate
	 */
	public List< TodoItem > getTodoListPaginationBetweenDate( Integer pageNum, Date fromDate, Date toDate ) {
		//
		return todoItemRepository.findAllByCreatedAtBetween( PageRequest.of( pageNum - 1, PAGE_POST_COUNT, Sort.by( Sort.Direction.DESC, "createdAt" ) ), fromDate, toDate );
	}
	
	/* 
	 * Todo List 조회 
	 *  - Pagination 
	 *  - By isDone
	 */
	public List< TodoItem > getTodoListPaginationByIsDone( Integer pageNum, Boolean isDone ) {
		//
		Page< TodoItem > page = todoItemRepository.findAllByIsDone( PageRequest.of( pageNum - 1, PAGE_POST_COUNT, Sort.by( Sort.Direction.DESC, "createdAt" ) ), isDone );
		List< TodoItem > todoList = page.getContent();
		List< TodoItem > todoItemList = new ArrayList<>();
		
		for( TodoItem todoItem: todoList ) {
			todoItemList.add( todoItem );
		}
		return todoItemList;
	}
	
	/*
	 * Todo List 조회 For Add 
	 */
	public List< TodoItem > getTodoListForAdd( Long parentId ) {
		//
		
		List< Long > excludeIdList = new ArrayList<>();
		TodoItem parentItem = getTodoItemOne( parentId );
		if ( parentItem != null ) {
			excludeIdList.add( parentItem.getItemId() );
			
			if ( !parentItem.getTodoChildList().isEmpty() ) {
				for ( int i=0; i<parentItem.getTodoChildList().size(); i++ ) {
					excludeIdList.add( parentItem.getTodoChildList().get( i ).getChildId() );
				}
			}
		}
		
		return todoItemRepository.findListByItemIdNotIn( Sort.by( Sort.Direction.DESC, "createdAt" ), excludeIdList );
	}
	
	/*
	 * Todo List 조회 For Remove 
	 */
	public List< TodoItem > getTodoListForRemove( Long parentId ) {
		//
		
		List< Long >includeIdList = new ArrayList<>();
		TodoItem parentItem = getTodoItemOne( parentId );
		if ( parentItem != null && !parentItem.getTodoChildList().isEmpty() ) {
			for ( int i=0; i<parentItem.getTodoChildList().size(); i++ ) {
				includeIdList.add( parentItem.getTodoChildList().get( i ).getChildId() );
			}
		}
		
		return todoItemRepository.findListByItemIdIn( Sort.by( Sort.Direction.DESC, "createdAt" ), includeIdList );
	}
	
	/* Todo Item 조회 */
	public TodoItem getTodoItemOne( Long itemId ) {
		//
		TodoItem item = todoItemRepository.findById( itemId ).orElse( null );
		if ( item == null ) {
			throw new CNotFoundException( CommonConstant.Todo.NOT_FOUND );
		}
		return item;
	}
	
	/* Todo Item 조회 By childId */
	public TodoItemChild getTodoItemChildByChildId( Long childId ) {
		//
		return todoItemChildRepository.findByChildId( childId );
	}
	
	/* Todo Item 조회 By parentId */
	public TodoItemChild getTodoItemChildByParentId( Long parentId ) {
		//
		return todoItemChildRepository.findByChildId( parentId );
	}
	
	/* Todo Item 수정 */
	public TodoItem updateTodoItem( Long itemId, TodoItem editedItem ) {
		//
		TodoItem item = todoItemRepository.findById( itemId ).orElse( null );
		
		if ( item != null ) {
			item.setTaskName( editedItem.getTaskName() );
			return todoItemRepository.save( item );
		}
		
		return todoItemRepository.save( item );
	}
	
	/* Todo Item State 수정 */
	public TodoItem updateTodoItemState( Long itemId ) {
		//
		TodoItem item = todoItemRepository.findById( itemId ).orElse( null );
		if ( item != null ) {
			item.setIsDone( !item.getIsDone() );
			todoItemRepository.save( item );
			return item;
		}
		return null;
	}
	
	/* Todo Item 삭제 */
	@Transactional
	public void deleteTodoItem( Long itemId ) {
		//
		TodoItem item = todoItemRepository.findById( itemId ).orElse( null );
		if ( item == null ) {
			throw new CNotFoundException( CommonConstant.Todo.NOT_FOUND );
		}
		
		todoItemRepository.delete( item );
	}
	
	@Transactional
	public void deleteTodoItemChild( Long parentId, Long childId ) {
		//
		TodoItemChild itemChild = todoItemChildRepository.findByParentIdAndChildId( parentId, childId );
		if ( itemChild == null ) {
			throw new CNotFoundException( CommonConstant.Todo.NOT_FOUND );
		} 

		todoItemChildRepository.delete( itemChild );
	}
	
	/* Todo Page List 조회: isDone */
	public Integer[] getTodoPageListByIsDone( Integer curPageNum, Boolean isDone ) {
		//
		Double todoTotalCount = Double.valueOf( this.getTodoListCountByIsDone( isDone ) );
		return this.getTodoPageList( curPageNum, todoTotalCount );
	}
	
	
	/* Todo Page List 조회: Between fromDate & toDate */
	public Integer[] getTodoPageListBetweenDate( Integer curPageNum, Date fromDate, Date toDate ) {
		//
		Double todoTotalCount = Double.valueOf( this.getTodoListCountByCreatedAtBetweenDate( fromDate, toDate ) );
		return this.getTodoPageList( curPageNum, todoTotalCount );
	}
	
	/* Todo Page List 조회: taskName */
	public Integer[] getTodoPageListByTaskName( Integer curPageNum, String taskName ) {
		//
		Double todoTotalCount = Double.valueOf( this.getTodoListCountByTaskName( taskName) );
		return this.getTodoPageList( curPageNum, todoTotalCount );
	}
	
	/* Todo Page List 조회: Total */
	public Integer[] getTodoPageListTotal( Integer curPageNum ) {
		//
		Double todoTotalCount = Double.valueOf( this.getTodoListCount() );
		return this.getTodoPageList( curPageNum, todoTotalCount );
	}
	
	/* Todo Page List 조회 */
	public Integer[] getTodoPageList( Integer curPageNum, Double todoTotalCount ) {
		//
		
		// Total TodoItem 기준으로 계산한 마지막 페이지 번호 ( 올림 계산 )
		Integer totalLastPageNum = ( int ) ( Math.ceil( ( todoTotalCount / PAGE_POST_COUNT ) ) );
		Integer[] pageList = new Integer[ totalLastPageNum ];
		
		// Current Page 기준으로 Block의 마지막 페이지 번호 계산 
		Integer blockLastPageNum = ( totalLastPageNum > curPageNum + BLOCK_PAGE_NUM_COUNT ) ? curPageNum + BLOCK_PAGE_NUM_COUNT : totalLastPageNum;
		
		// 페이지 시작 번호 조정 
		curPageNum = ( curPageNum <= 3 ) ? 1 : curPageNum - 2;
		
		// 페이지 번호 할당 
		for ( int val=curPageNum, i=0; val <= blockLastPageNum; val++, i++ ) {
			pageList[i] = val;
		}
		
		return pageList;
	}
	
	/* Todo Item의 완료 가능 여부 조회 */
	public Boolean checkTodoItemIsCompletable( Long itemId ) {
		//
		TodoItem todoItem = getTodoItemOne( itemId );
		List< TodoItemChild > todoItemChildList = todoItem.getTodoChildList();
		
		for( TodoItemChild itemChild: todoItemChildList ) {
			if ( !getTodoItemOne( itemChild.getChildId() ).getIsDone() ) {
				return false;
			}
		}
		
		return true;
	}
	
	/* Count Todo Between FromDate, ToDate */
	private Long getTodoListCountByCreatedAtBetweenDate( Date fromDate, Date toDate ) {
		//
		return todoItemRepository.countByCreatedAtBetween( fromDate, toDate );
	}
	
	/* Count Todo By TaskName */
	private Long getTodoListCountByTaskName( String taskName ) {
		//
		return todoItemRepository.countByTaskNameLike( taskName );
	}
	
	/* Count Todo By isDone */
	private Long getTodoListCountByIsDone( Boolean isDone ) {
		//
		return todoItemRepository.countByIsDone( isDone );
	}
	
	/* Count Todo total */
	private Long getTodoListCount() {
		//
		return todoItemRepository.count();
	}
}