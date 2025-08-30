# Stage 1: Build the application using Maven
# We use a specific version of Maven with Java 21 to build our project.
FROM maven:3.9-eclipse-temurin-21 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download Maven dependencies
RUN ./mvnw dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Build the application, skipping tests for a faster deployment build
RUN ./mvnw clean install -DskipTests


# Stage 2: Create the final, lightweight production image
# We use a slim JRE image which is much smaller than a full JDK.
FROM eclipse-temurin:21-jre-jammy

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/ai-quiz-0.0.1-SNAPSHOT.jar ./app.jar

# Expose the port the application will run on (must match application.properties)
EXPOSE 8081

# Command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
