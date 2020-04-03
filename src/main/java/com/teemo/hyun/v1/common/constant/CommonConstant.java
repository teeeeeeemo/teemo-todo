package com.teemo.hyun.v1.common.constant;

public class CommonConstant {

	public class Common {
		//
		/* SUCCESS */
		public static final String SUCCESS_CODE 	= "0000";
		public static final String SUCCESS_MESSAGE  = "SUCCESS";
		
		/* FAILED */
		public static final String FAILED_CODE	    = "-1111";
		public static final String FAILED_MESSAGE 	= "FAILED";
		
	}
	
	public class Todo {
		//
		/* Not Found */
		public static final String NOT_FOUND = "Not Found Todo";
		public static final String NOT_FOUND_CHILD_ID = "Not Found ChildId";
		
		/* Bad Request */
		public static final String BAD_REQUEST 			 	  = "Bad Request Todo";
		public static final String BAD_REQUEST_TASK_NAME 	  = "Bad Request TaskName";
		public static final String BAD_REQUEST_DATE 		  = "Bad Request Date";
		public static final String BAD_REQUEST_CHILD_ID  	  = "Bad Request ChildId";
		public static final String BAD_REQUEST_SORT_DIRECTION = "Bad Request SortDirection - ASC / DESC";
				
		/* Date Format */
		public static final String DATE_FORMAT    = "yyyy-MM-dd HH:mm:ss";
		public static final String FROM_DATE_TIME = " 00:00:00";
		public static final String TO_DATE_TIME   = " 23:59:59";
		
	}
}