package com.teemo.hyun.v1.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.teemo.hyun.v1.entity.TodoItem;

@Repository
public interface TodoItemRepository extends JpaRepository< TodoItem, Long > {

	/* Find One */
	TodoItem findByItemId( Long itemId );
	
	/* Find All */
	
	/* Find List */
	Page< TodoItem > findAllByTaskNameLike( Pageable pageable, String taskName );
	List< TodoItem > findAllByCreatedAtBetween( Pageable pageable, Date fromDate, Date toDate );
	Page< TodoItem > findAllByIsDone( Pageable pageable, Boolean isDone );
	
	/* Delete */
	void deleteByItemId( Long itemId );
	
	/* Count */
	Long countByTaskNameLike( String taskName );
	Long countByIsDone( Boolean isDone );
	Long countByCreatedAtBetween( Date fromDate, Date toDate );
	
}