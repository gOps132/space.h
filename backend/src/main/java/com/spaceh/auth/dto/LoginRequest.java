package com.spaceh.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank(message = "University ID is required.")
        @Pattern(
                regexp = "^\\d{2}-\\d{4}(-\\d{2})?$",
                message = "University ID must match XX-XXXX or XX-XXXX-XX."
        )
        String universityId,
        @NotBlank(message = "Password is required.")
        String password
) {
}
