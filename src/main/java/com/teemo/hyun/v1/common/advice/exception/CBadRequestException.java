package com.teemo.hyun.v1.common.advice.exception;

public class CBadRequestException extends RuntimeException {
	/**
	 * 
	 */
	private static final long serialVersionUID = -1922729153505807937L;

	//
	public CBadRequestException( String message, Throwable t ) {
		super( message, t );
	}

	public CBadRequestException( String message ) {
		super( message );
	}
	
	public CBadRequestException( ) {
		super();
	}

}