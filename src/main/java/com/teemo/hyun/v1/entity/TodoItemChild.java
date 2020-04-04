package com.teemo.hyun.v1.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table( name = "todo_child",
		uniqueConstraints = { // UNIQUE 설정: child_id, parent_id
		@UniqueConstraint(
				columnNames = { "child_id", "parent_id" }
		) } )
public class TodoItemChild {

	@Id
	@GeneratedValue( strategy = GenerationType.AUTO )
	@JsonIgnore
	@Column( name = "id" )
	private Long id;
	
	@Column( name = "child_id" )
	private Long childId;
	
	@Column( name = "parent_id" )
	private Long parentId;
	
	@ManyToOne
	@JoinColumn( name = "item_id" )
	@JsonIgnore
	private TodoItem todoItem;
	
	@JsonInclude( Include.NON_NULL )
	@Transient
	private String taskName;
	
	@JsonInclude( Include.NON_NULL )
	@Transient
	private Boolean isDone;
}