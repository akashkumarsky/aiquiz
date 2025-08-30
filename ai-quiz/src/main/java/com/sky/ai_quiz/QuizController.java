package com.sky.ai_quiz;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.api.key}")
    private String apiKey;

    @Value("${google.api.url}")
    private String apiUrl;

    public QuizController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * UPDATED Endpoint: Generates quiz questions based on a specific category.
     * The category is passed as a path variable.
     * @param category The topic for the quiz questions (e.g., "Java", "React").
     * @return A Mono wrapping a list of 10 QuizQuestion objects.
     */
    @GetMapping("/generate/{category}")
    public Mono<List<QuizQuestion>> generateQuiz(@PathVariable String category) {

        // The prompt is now dynamic and includes the selected category and requests 10 questions.
        String prompt = String.format(
            "Generate 10 multiple-choice quiz questions about '%s'. " +
            "Provide the response as a valid JSON array. Each object in the array should have the " +
            "following exact keys: \"question\", \"options\", and \"correctAnswer\". " +
            "\"options\" should be an array of 4 strings. " +
            "\"question\" should be a string. " +
            "\"correctAnswer\" should be a string that exactly matches one of the items in the \"options\" array. " +
            "Do not include any introductory text, markdown formatting, or code fences in your response. " +
            "The entire response should be only the JSON array.",
            category // Inject the category into the prompt
        );

        var requestBody = new GeminiDtos.GeminiRequest(
            List.of(new GeminiDtos.Content(List.of(new GeminiDtos.Part(prompt)))),
            new GeminiDtos.GenerationConfig("application/json")
        );

        return webClient.post()
            .uri(apiUrl + "?key=" + apiKey)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(GeminiDtos.GeminiResponse.class)
            .map(geminiResponse -> {
                String jsonText = geminiResponse.candidates().get(0).content().parts().get(0).text();
                try {
                    return objectMapper.readValue(jsonText, new TypeReference<List<QuizQuestion>>() {});
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                    // In case of an error, it's better to throw an exception that can be handled globally
                    throw new RuntimeException("Failed to parse quiz questions from AI response.", e);
                }
            });
    }
}
