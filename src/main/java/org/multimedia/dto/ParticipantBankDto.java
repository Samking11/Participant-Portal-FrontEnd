package org.multimedia.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Participant Bank data transfer object")
public class ParticipantBankDto {

    @Schema(description = "Bank identifier (for update requests)", example = "1")
    private Long id;

    @NotBlank(message = "Bank name is required")
    @Size(max = 150)
    @Schema(description = "Official Bank Name", example = "Commercial Bank of Ethiopia", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "BIC is required")
    @Size(min = 8, max = 11, message = "BIC must be between 8 and 11 characters")
    @Schema(description = "Bank Identifier Code (BIC / SWIFT)", example = "CBETETAA", requiredMode = Schema.RequiredMode.REQUIRED)
    private String bic;

    @Size(max = 20)
    @Schema(description = "Bank short code or abbreviation", example = "CBE")
    private String shortName;

    @Size(max = 255)
    @Schema(description = "Headquarters / branch address", example = "Sudan Street, Addis Ababa, Ethiopia")
    private String address;

    @Size(max = 100)
    @Schema(description = "Official contact email address", example = "contact@cbe.com.et")
    private String email;

    @Size(max = 50)
    @Schema(description = "Official telephone contact number", example = "+251 11 123 4567")
    private String phoneNumber;

    @Schema(description = "Bank logo image path (optional in branch 1)", example = "/uploads/logos/CBETETAA_logo.png")
    private String logoPath;

    @Schema(description = "Operational status", example = "ACTIVE", defaultValue = "ACTIVE")
    @Builder.Default
    private String status = "ACTIVE";
}
