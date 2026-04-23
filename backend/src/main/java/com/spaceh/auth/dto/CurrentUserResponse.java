package com.spaceh.auth.dto;

import com.spaceh.user.AccountStatus;
import com.spaceh.user.UserRole;

public record CurrentUserResponse(
        String universityId,
        String fullName,
        String email,
        UserRole role,
        AccountStatus accountStatus
) {
}
