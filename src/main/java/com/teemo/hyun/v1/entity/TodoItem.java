package com.teemo.hyun.v1.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotEmpty;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table( name = "todo")
public class TodoItem {

	@Id
	@GeneratedValue( strategy = GenerationType.IDENTITY )
	@Column( name = "itemId" )
	private Long itemId;
	
	@OneToMany( mappedBy = "todoItem", cascade = CascadeType.ALL )
	private List< TodoItemChild > todoChildList = new ArrayList< TodoItemChild >();
	
	@Column( name = "task_name" )
	@NotEmpty( message = " * Enter Task Name" )
	private String taskName;
	
	@Column( name = "is_done" )
	private Boolean isDone;
	
	@Column( name = "created_at" )
	@CreationTimestamp
	private Date createdAt = new Date();
	
	@Column( name = "updated_at" )
	@UpdateTimestamp
	private Date updatedAt = new Date();
	
	@JsonInclude( Include.NON_NULL )
	@Transient
	private Boolean isCompletable;
	
	@JsonInclude( Include.NON_NULL )
	@Transient
	private Boolean isChild;
	
	@JsonInclude( Include.NON_NULL )
	@Transient
	private Integer lastPage;

}