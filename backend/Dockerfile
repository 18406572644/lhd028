FROM eclipse-temurin:11-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 6028
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=6028"]
