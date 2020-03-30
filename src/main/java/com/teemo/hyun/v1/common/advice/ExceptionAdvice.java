package com.teemo.hyun.v1.common.advice;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.teemo.hyun.v1.common.advice.exception.CBadRequestException;
import com.teemo.hyun.v1.common.advice.exception.CNotFoundException;
import com.teemo.hyun.v1.common.constant.CommonConstant;
import com.teemo.hyun.v1.model.CommonResponse;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestControllerAdvice( annotations = RestController.class )
public class ExceptionAdvice {

	private static Logger logger = LoggerFactory.getLogger( ExceptionAdvice.class );
	
	@ExceptionHandler( CNotFoundException.class )
	@ResponseStatus( HttpStatus.NOT_FOUND )
	protected CommonResponse customNotFoundException( HttpServletRequest request, CNotFoundException e ) {
		//
		logger.debug( "# ERROR OCCURED # ------------------------------------------------------------" );
		logger.debug( "# ERROR: {}", e.getMessage() );
		
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.FAILED_CODE )
													  .message( e.getMessage() )
													  .data( null )
													  .build();
		
		return commonResponse;
		
	}
	
	@ExceptionHandler( CBadRequestException.class )
	@ResponseStatus( HttpStatus.BAD_REQUEST )
	protected CommonResponse customBadRequestException( HttpServletRequest request, CBadRequestException e ) {
		//
		logger.debug( "# ERROR OCCURED # ------------------------------------------------------------" );
		logger.debug( "# ERROR: {}", e.getMessage() );
		
		CommonResponse commonResponse = CommonResponse.builder()
													  .code( CommonConstant.Common.FAILED_CODE )
													  .message( e.getMessage() )
													  .build();
		
		return commonResponse;
		
	}
}