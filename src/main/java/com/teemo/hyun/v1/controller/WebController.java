package com.teemo.hyun.v1.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

	@GetMapping( value = { "/", "index" } )
	public String index( ) {
		//
		return "index";
	}
}