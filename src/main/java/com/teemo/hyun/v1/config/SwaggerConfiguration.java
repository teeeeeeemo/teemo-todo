package com.teemo.hyun.v1.config;

import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfiguration {
	
	public Docket swaggerApi() {
		//
		return new Docket( DocumentationType.SWAGGER_2 ).apiInfo( apiInfo() ).select()
														.apis( RequestHandlerSelectors.basePackage( "com.teemo.hyun.controller" ) ) // com.teemo.hyun.controller 하단의 Controller의 내용을 읽어 mapping된 resource들을 문서화
														.paths( PathSelectors.any() ) // PathsSelectors.ant( "/v1/**" )과 같이 작성 가능 
														.build()
														.useDefaultResponseMessages( false ); // 기본으로 세팅되는 200, 401, 403, 404 메시지 미표시함. 
	
	}

	/*
	 * swaggerInfo: 문서에 대한 설명과 작성자 정보 노출 가능 
	 */
	private ApiInfo apiInfo() {
		//
		return new ApiInfoBuilder().title( "Teemo Todo Swagger-UI" )
								   .description( "https://documenter.getpostman.com/view/1923436/SzYaVy4M?version=latest#5e7049c3-6172-42c6-bf67-4de72da998a1" )
								   .license( "Hyun" )
								   .licenseUrl( "https://teeeeeeemo.com" )
								   .version( "1" )
								   .build();
	}
}