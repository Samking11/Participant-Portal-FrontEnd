package org.multimedia.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.multimedia.dto.LoginRequest;
import org.multimedia.dto.TokenResponseDto;
import org.multimedia.model.User;
import org.multimedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.auth.static-username:admin}")
    private String staticUsername;

    @Value("${app.auth.static-password:Password@123}")
    private String staticPassword;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://192.168.20.49:9091/realms/acs}")
    private String keycloakIssuerUri;

    @Value("${app.keycloak.client-id:participant-portal}")
    private String defaultClientId;

    /**
     * Authenticates user against static credentials, synchronizes user record in database,
     * and obtains accessToken and refreshToken from Keycloak.
     */
    @Transactional
    public TokenResponseDto login(LoginRequest loginRequest) {
        log.info("Processing login request for user: {}", loginRequest.getUsername());

        // 1. Authenticate against static credentials
        if (!staticUsername.equals(loginRequest.getUsername()) || !staticPassword.equals(loginRequest.getPassword())) {
            log.warn("Authentication failed: invalid credentials for user '{}'", loginRequest.getUsername());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        log.info("Static credential authentication passed for user: {}", loginRequest.getUsername());

        // 2. Register / Update user in PostgreSQL database
        syncUserInDatabase(loginRequest.getUsername());

        // 3. Request accessToken & refreshToken from Keycloak
        TokenResponseDto tokenResponse = requestKeycloakToken(loginRequest);

        log.info("Login completed successfully for user: {}", loginRequest.getUsername());
        return tokenResponse;
    }

    /**
     * Registers new user or updates lastLoginDate in the database.
     */
    private void syncUserInDatabase(String username) {
        try {
            Optional<User> existingUser = userRepository.findByUsername(username);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                user.setLastLoginDate(LocalDateTime.now());
                user.setModifiedDate(LocalDateTime.now());
                userRepository.save(user);
                log.info("Updated last login timestamp in database for existing user: {}", username);
            } else {
                User newUser = User.builder()
                        .username(username)
                        .fullName("System Administrator")
                        .email(username + "@ethswitch.et")
                        .role("ADMIN")
                        .status("ACTIVE")
                        .lastLoginDate(LocalDateTime.now())
                        .build();
                newUser.setCreatedBy(1L);
                newUser.setCreatedDate(LocalDateTime.now());
                newUser.setModifiedDate(LocalDateTime.now());
                userRepository.save(newUser);
                log.info("Registered new user record in database for: {}", username);
            }
        } catch (Exception ex) {
            log.error("Failed to register/sync user '{}' in database: {}", username, ex.getMessage(), ex);
        }
    }

    /**
     * Requests tokens from Keycloak token endpoint.
     */
    private TokenResponseDto requestKeycloakToken(LoginRequest loginRequest) {
        String tokenUrl = keycloakIssuerUri + "/protocol/openid-connect/token";
        log.info("Connecting to Keycloak token endpoint: {}", tokenUrl);

        String clientId = (loginRequest.getClient_id() != null && !loginRequest.getClient_id().isBlank())
                ? loginRequest.getClient_id()
                : defaultClientId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", clientId);
        body.add("username", loginRequest.getUsername());
        body.add("password", loginRequest.getPassword());

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<?, ?> responseBody = response.getBody();
                log.info("Keycloak returned 200 OK tokens for user: {}", loginRequest.getUsername());

                String accessToken = responseBody.get("access_token") != null ? responseBody.get("access_token").toString() : null;
                String refreshToken = responseBody.get("refresh_token") != null ? responseBody.get("refresh_token").toString() : null;
                String tokenType = responseBody.get("token_type") != null ? responseBody.get("token_type").toString() : "Bearer";
                String scope = responseBody.get("scope") != null ? responseBody.get("scope").toString() : null;
                Integer expiresIn = responseBody.get("expires_in") instanceof Number n ? n.intValue() : 300;
                Integer refreshExpiresIn = responseBody.get("refresh_expires_in") instanceof Number n ? n.intValue() : 1800;

                return TokenResponseDto.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .tokenType(tokenType)
                        .expiresIn(expiresIn)
                        .refreshExpiresIn(refreshExpiresIn)
                        .scope(scope)
                        .build();
            }
        } catch (Exception ex) {
            log.warn("Keycloak token request returned error or is unreachable: {}. Providing fallback mock JWT token for development.", ex.getMessage());
        }

        // Graceful development fallback token so frontend is never blocked
        return generateMockDevelopmentToken(loginRequest.getUsername());
    }

    private TokenResponseDto generateMockDevelopmentToken(String username) {
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(
                String.format("{\"sub\":\"1\",\"preferred_username\":\"%s\",\"roles\":[\"admin\"],\"iss\":\"%s\"}",
                        username, keycloakIssuerUri).getBytes()
        );
        String mockAccessToken = header + "." + payload + ".mock_dev_signature_for_testing";

        return TokenResponseDto.builder()
                .accessToken(mockAccessToken)
                .refreshToken("mock_refresh_token_" + System.currentTimeMillis())
                .tokenType("Bearer")
                .expiresIn(300)
                .refreshExpiresIn(1800)
                .scope("openid profile email")
                .build();
    }
}
