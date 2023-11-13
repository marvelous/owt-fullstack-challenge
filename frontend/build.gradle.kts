import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.0.1"
}

tasks.register<NpmTask>("build") {
    dependsOn("npm_install")
    args.value(listOf("run", "build"))
}
