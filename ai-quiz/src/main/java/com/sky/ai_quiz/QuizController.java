package com.sky.ai_quiz;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin; // 1. Add this import
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173") // 2. Add this annotation
public class QuizController {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // These values will be injected from application.properties
    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.api.url}")
    private String apiUrl;

    // Constructor to initialize WebClient, which is used for making HTTP requests
    public QuizController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Endpoint to generate and retrieve a list of quiz questions.
     * @return A Mono wrapping a list of QuizQuestion objects, which Spring will serialize to JSON.
     */
    @GetMapping("/generate")
    public Mono<List<QuizQuestion>> generateQuiz() {

        String prompt = "Generate 8 multiple-choice quiz questions about 'Google API Keys'. " +
                        "Provide the response as a valid JSON array. Each object in the array should have the " +
                        "following exact keys: \"question\", \"options\", and \"correctAnswer\". " +
                        "\"options\" should be an array of 4 strings. " +
                        "\"question\" should be a string. " +
                        "\"correctAnswer\" should be a string that exactly matches one of the items in the \"options\" array. " +
                        "Do not include any introductory text, markdown formatting, or code fences in your response. " +
                        "The entire response should be only the JSON array.";

        // Construct the request body for the Gemini API using our DTOs
        var requestBody = new GeminiDtos.GeminiRequest(
            List.of(new GeminiDtos.Content(List.of(new GeminiDtos.Part(prompt)))),
            new GeminiDtos.GenerationConfig("application/json")
        );

        // Make the asynchronous API call to Google Gemini
        return webClient.post()
            .uri(apiUrl + "?key=" + apiKey)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(GeminiDtos.GeminiResponse.class)
            .map(geminiResponse -> {
                // The API's response contains a text field which is a JSON string.
                // We need to extract and parse this string into our list of questions.
                String jsonText = geminiResponse.candidates().get(0).content().parts().get(0).text();
                try {
                    // Use ObjectMapper to parse the JSON string into our List<QuizQuestion>
                    return objectMapper.readValue(jsonText, new TypeReference<List<QuizQuestion>>() {});
                } catch (JsonProcessingException e) {
                    // Basic error handling. In a real app, you'd want more robust logging.
                    e.printStackTrace();
                    return List.of(); // Return an empty list on failure
                }
            });
    }
}

