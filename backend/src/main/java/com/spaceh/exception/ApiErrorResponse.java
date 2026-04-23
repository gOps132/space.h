package com.spaceh.exception;

import java.util.Map;

public record ApiErrorResponse(
        String message,
        Map<String, String> fieldErrors
) {

    public static ApiErrorResponse messageOnly(String message) {
        return new ApiErrorResponse(message, Map.of());
    }
}
