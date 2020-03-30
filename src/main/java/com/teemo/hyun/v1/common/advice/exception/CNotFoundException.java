package com.teemo.hyun.v1.common.advice.exception;

public class CNotFoundException extends RuntimeException {
	/**
	 * 
	 */
	private static final long serialVersionUID = -1922729153505807937L;

	//
	public CNotFoundException( String message, Throwable t ) {
		super( message, t );
	}

	public CNotFoundException( String message ) {
		super( message );
	}
	
	public CNotFoundException( ) {
		super();
	}

}
