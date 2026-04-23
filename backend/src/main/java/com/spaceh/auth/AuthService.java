package com.spaceh.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.spaceh.auth.dto.AuthResponse;
import com.spaceh.auth.dto.CurrentUserResponse;
import com.spaceh.auth.dto.LoginRequest;
import com.spaceh.user.AppUser;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.universityId(), request.password())
            );
            AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
            String token = jwtService.generateToken(principal);
            return new AuthResponse(token, toCurrentUser(principal.getAppUser()));
        } catch (BadCredentialsException exception) {
            throw new BadCredentialsException("Invalid university ID or password.");
        }
    }

    public CurrentUserResponse currentUser(AppUserPrincipal principal) {
        return toCurrentUser(principal.getAppUser());
    }

    private CurrentUserResponse toCurrentUser(AppUser appUser) {
        return new CurrentUserResponse(
                appUser.getUniversityId(),
                appUser.getFullName(),
                appUser.getEmail(),
                appUser.getRole(),
                appUser.getAccountStatus()
        );
    }
}
