package com.teemo.hyun.v1.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.teemo.hyun.v1.entity.TodoItem;

@Repository
public interface TodoItemRepository extends JpaRepository< TodoItem, Long > {

	/* Find One */
	TodoItem findByItemId( Long itemId );
	
	/* Find All */
	Page< TodoItem > findAllByTaskNameLike( Pageable pageable, String taskName );
	List< TodoItem > findAllByCreatedAtBetween( Pageable pageable, Date fromDate, Date toDate ); // TODO 수정 
	Page< TodoItem > findAllByIsDone( Pageable pageable, Boolean isDone );
	
	/* Find List */
	List< TodoItem > findListByItemIdNotIn( Sort sort, List< Long > excludeIdList );
	List< TodoItem > findListByItemIdIn( Sort sort, List< Long > includeIdList );
	
	/* Delete */
	void deleteByItemId( Long itemId );
	
	/* Count */
	Long countByTaskNameLike( String taskName );
	Long countByIsDone( Boolean isDone );
	Long countByCreatedAtBetween( Date fromDate, Date toDate );
	
}