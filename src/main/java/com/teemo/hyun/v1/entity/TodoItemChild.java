package com.teemo.hyun.v1.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table( name = "todo_child" )
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
}