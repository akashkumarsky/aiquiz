# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the Maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# --- THE FIX IS HERE ---
# Add execute permissions to the Maven wrapper script
RUN chmod +x ./mvnw

# Now that the script is executable, download dependencies
RUN ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application
RUN ./mvnw clean install -DskipTests


# Stage 2: Create the final, lightweight production image
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/ai-quiz-0.0.1-SNAPSHOT.jar ./app.jar

# Expose the port the application will run on
EXPOSE 8081

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
