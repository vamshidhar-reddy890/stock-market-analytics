# ==========================================
# 1. Build stage with Maven and OpenJDK 17
# ==========================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy project definition and source code
COPY pom.xml .
COPY src ./src

# Build the Spring Boot application (skip test execution)
RUN mvn clean package -DskipTests

# ==========================================
# 2. Production runtime stage
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /app/target/spring-boot-project-0.0.1-SNAPSHOT.jar app.jar

# Expose default port (Render will dynamically override via PORT env var)
EXPOSE 9090

# Launch Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
