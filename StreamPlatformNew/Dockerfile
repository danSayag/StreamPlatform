# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only the POM first so dependency resolution is cached across builds
# as long as pom.xml doesn't change.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# JWT_SECRET (>= 32 bytes, for HS256) must be provided at runtime, e.g.:
#   docker run -e JWT_SECRET=your-32-byte-min-secret -p 8080:8080 streamplatform
# The app fails fast on startup if it's missing or too short.
ENTRYPOINT ["java", "-jar", "app.jar"]
