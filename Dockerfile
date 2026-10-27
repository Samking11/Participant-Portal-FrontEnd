# Stage 1: Build the application using Gradle
FROM gradle:7.5.1-jdk17 AS builder

WORKDIR /app

# Copy build definitions
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src ./src

# Build the executable JAR using the Gradle installation in the builder image
RUN gradle bootJar -x test --no-daemon

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create folders for uploads and runtime logs
RUN mkdir -p /uploads/logos /app/logs

# Copy executable jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose application port
EXPOSE 9081

# Set default active profile to dev
ENV SPRING_PROFILES_ACTIVE=dev

# Start Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
