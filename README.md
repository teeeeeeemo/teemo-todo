

# teemo-todo

## Requirements

빌드 및 실행을 위한 필요 사항:

- [OpenJDK8](https://openjdk.java.net/)
	- [OS X] Homebrew command: 
		```shell
		brew tap AdoptOpenJDK/openjdk
		brew cask install adoptopenjdk8
		```

- [Gradle](https://gradle.org/install/)
	- [OS X] Homebrew command: 
		```shell
		brew install gradle
		```
	
## Running the application locally

1. IDE 사용 ( STS, eclipse, intelliJ 등 )
2. CLI 사용 
	```shell
	gradle wrap
	./gradlew build
	./gradlew run
	```
![Build And Run](https://user-images.githubusercontent.com/25288225/78473043-905cc080-7778-11ea-8322-568fe076a4f3.png)

3. Main Page URL: http://localhost:3333
![Main Page](https://user-images.githubusercontent.com/25288225/78473088-d7e34c80-7778-11ea-9272-93f568940386.png)


## Document
1. Postman 
[WebPage](https://documenter.getpostman.com/view/1923436/SzYaVy4M?version=latest#4d37d514-fb0b-4b52-ad02-f78167935eca)
