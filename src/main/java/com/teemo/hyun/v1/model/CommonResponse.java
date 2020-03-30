package com.teemo.hyun.v1.model;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CommonResponse {
	
	private String code;
	private String message;
	private Object data;

}