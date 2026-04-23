package com.spaceh.health;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/health")
public class PublicHealthController {

    @GetMapping
    public Map<String, Object> health() {
        return Map.of(
                "service", "spaceh-backend",
                "status", "UP",
                "timestamp", Instant.now().toString()
        );
    }
}
