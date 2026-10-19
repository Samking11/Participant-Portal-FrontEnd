package org.multimedia.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_participant_banks")
@Schema(description = "Participant Bank profile and configurations")
public class ParticipantBank extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Primary Key / Unique Bank ID", example = "1")
    private Long id;

    @NotBlank(message = "Bank name is required")
    @Size(max = 150)
    @Column(name = "name", nullable = false, unique = true, length = 150)
    @Schema(description = "Official Bank Name", example = "Commercial Bank of Ethiopia")
    private String name;

    @NotBlank(message = "BIC is required")
    @Size(min = 8, max = 11, message = "BIC must be between 8 and 11 characters")
    @Column(name = "bic", nullable = false, unique = true, length = 11)
    @Schema(description = "Bank Identifier Code (BIC / SWIFT)", example = "CBETETAA")
    private String bic;

    @Size(max = 20)
    @Column(name = "short_name", length = 20)
    @Schema(description = "Bank short code or abbreviation", example = "CBE")
    private String shortName;

    @Size(max = 255)
    @Column(name = "address", length = 255)
    @Schema(description = "Headquarters / branch address", example = "Sudan Street, Addis Ababa, Ethiopia")
    private String address;

    @Size(max = 100)
    @Column(name = "email", length = 100)
    @Schema(description = "Official contact email address", example = "contact@cbe.com.et")
    private String email;

    @Size(max = 50)
    @Column(name = "phone_number", length = 50)
    @Schema(description = "Official telephone contact number", example = "+251 11 123 4567")
    private String phoneNumber;

    @Column(name = "logo_path", length = 500)
    @Schema(description = "Path or URL to the bank's uploaded logo image", example = "/uploads/logos/CBETETAA_logo.png")
    private String logoPath;

    @Column(name = "status", length = 20)
    @Schema(description = "Operational status of the participant bank", example = "ACTIVE")
    @Builder.Default
    private String status = "ACTIVE";
}
