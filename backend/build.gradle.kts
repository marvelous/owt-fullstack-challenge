plugins {
	java
	id("org.springframework.boot") version "3.0.12"
	id("io.spring.dependency-management") version "1.1.3"
}

group = "swiss.owt.fullstack"
version = "0.0.1-SNAPSHOT"

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
   archiveFileName.set("backend.jar")
}

java {
	sourceCompatibility = JavaVersion.VERSION_17
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-data-rest")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	runtimeOnly("com.h2database:h2")
	runtimeOnly("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.2.0")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	implementation("org.springframework.security:spring-security-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
