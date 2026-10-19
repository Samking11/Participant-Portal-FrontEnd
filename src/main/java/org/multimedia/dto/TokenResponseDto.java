package org.multimedia.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Authentication token response payload")
public class TokenResponseDto {

    @JsonProperty("access_token")
    @Schema(description = "Keycloak issued JWT access token", example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @JsonProperty("expires_in")
    @Schema(description = "Access token validity in seconds", example = "300")
    private Integer expiresIn;

    @JsonProperty("refresh_expires_in")
    @Schema(description = "Refresh token validity in seconds", example = "1800")
    private Integer refreshExpiresIn;

    @JsonProperty("refresh_token")
    @Schema(description = "Keycloak issued refresh token", example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @JsonProperty("token_type")
    @Schema(description = "Token type", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @JsonProperty("scope")
    @Schema(description = "Granted OAuth2 scopes", example = "openid profile email")
    private String scope;
}
