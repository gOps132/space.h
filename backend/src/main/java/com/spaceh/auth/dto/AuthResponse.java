package com.spaceh.auth.dto;

public record AuthResponse(
        String token,
        CurrentUserResponse user
) {
}
