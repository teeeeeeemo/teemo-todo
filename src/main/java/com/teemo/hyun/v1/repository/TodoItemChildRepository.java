package com.teemo.hyun.v1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.teemo.hyun.v1.entity.TodoItemChild;

@Repository
public interface TodoItemChildRepository extends JpaRepository< TodoItemChild, Long > {

	/* Find One */
	TodoItemChild findByParentIdAndChildId( Long parentId, Long childId );
	
	/* Delete */
	void deleteByChildId( Long childId );
	
}