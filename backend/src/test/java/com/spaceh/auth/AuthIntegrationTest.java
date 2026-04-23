package com.spaceh.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.spaceh.user.AccountStatus;
import com.spaceh.user.AppUser;
import com.spaceh.user.AppUserRepository;
import com.spaceh.user.UserRole;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        appUserRepository.deleteAll();
        appUserRepository.save(new AppUser(
                "24-0001-01",
                "Ada Lovelace",
                "ada@spaceh.test",
                passwordEncoder.encode("library-pass"),
                UserRole.STUDENT,
                AccountStatus.ACTIVE
        ));
        appUserRepository.save(new AppUser(
                "23-1024",
                "Grace Hopper",
                "grace@spaceh.test",
                passwordEncoder.encode("compiler-pass"),
                UserRole.FACULTY,
                AccountStatus.ACTIVE
        ));
    }

    @Test
    void loginRejectsMalformedUniversityId() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "universityId": "2024-0001",
                                  "password": "library-pass"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed."))
                .andExpect(jsonPath("$.fieldErrors.universityId")
                        .value("University ID must match XX-XXXX or XX-XXXX-XX."));
    }

    @Test
    void loginReturnsJwtForValidCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "universityId": "24-0001-01",
                                  "password": "library-pass"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.universityId").value("24-0001-01"))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));
    }

    @Test
    void loginSupportsOldUniversityIdFormat() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "universityId": "23-1024",
                                  "password": "compiler-pass"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.universityId").value("23-1024"))
                .andExpect(jsonPath("$.user.role").value("FACULTY"));
    }

    @Test
    void loginRejectsInvalidCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "universityId": "24-0001-01",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid university ID or password."));
    }

    @Test
    void meReturnsAuthenticatedUserForBearerToken() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "universityId": "24-0001-01",
                                  "password": "library-pass"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String token = JsonTestSupport.readJsonField(loginResult.getResponse().getContentAsString(), "token");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.universityId").value("24-0001-01"))
                .andExpect(jsonPath("$.fullName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    void meRejectsUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
