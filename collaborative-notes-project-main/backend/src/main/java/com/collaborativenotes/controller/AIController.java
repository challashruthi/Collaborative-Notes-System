package com.collaborativenotes.controller;

import com.collaborativenotes.dto.SummarizeResponse;
import com.collaborativenotes.model.Note;
import com.collaborativenotes.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    @Autowired private NoteRepository noteRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @PostMapping("/{noteId}/summarize")
    public ResponseEntity<SummarizeResponse> summarizeNote(@PathVariable Long noteId) {
        Note note = noteRepository.findById(noteId).orElse(null);
        
        if (note == null || note.getContent() == null || note.getContent().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // Strip HTML tags for the AI
            String plainText = note.getContent().replaceAll("<[^>]*>", "");
            
            // Prepare Request Body with proper Generics
            Map<String, Object> part = new HashMap<>();
            part.put("text", "Summarize this note in 3-4 concise bullet points: " + plainText);

            Map<String, Object> contents = new HashMap<>();
            contents.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contents));

            String fullUrl = apiUrl + "?key=" + apiKey;
            
            // DEBUG: This will show you exactly what is being called in the Eclipse Console
            System.out.println("DEBUG: Calling Gemini API at: " + fullUrl);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, requestBody, Map.class);
            
            if (response.getBody() != null) {
                // Safely navigate the JSON response
                List<?> candidates = (List<?>) response.getBody().get("candidates");
                Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
                Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
                List<?> parts = (List<?>) content.get("parts");
                Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
                
                String aiSummary = (String) firstPart.get("text");
                return ResponseEntity.ok(new SummarizeResponse(aiSummary));
            }
            
            return ResponseEntity.status(500).body(new SummarizeResponse("Empty response from AI."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new SummarizeResponse("Error: " + e.getMessage()));
        }
    }
}
