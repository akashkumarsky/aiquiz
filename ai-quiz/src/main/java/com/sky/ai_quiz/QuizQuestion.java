package com.sky.ai_quiz;

import java.util.List;

/**
 * A Java record to represent a single multiple-choice quiz question.
 * Using a record provides a concise, immutable data carrier.
 *
 * @param question The text of the question.
 * @param options A list of possible answers (strings).
 * @param correctAnswer The correct answer, which must match one of the options.
 */
public record QuizQuestion(
    String question,
    List<String> options,
    String correctAnswer
) {}
