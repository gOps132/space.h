FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml -B dependency:go-offline

COPY backend backend
RUN mvn -f backend/pom.xml -B clean package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
