FROM docker.io/library/openjdk:17
COPY build/libs/backend.jar /opt/
WORKDIR /var/backend
ENTRYPOINT ["java", "-jar", "/opt/backend.jar"]
