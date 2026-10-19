package org.multimedia.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_users")
@Schema(description = "Registered user account record in database")
public class User extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Primary Key / User ID", example = "1")
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    @Schema(description = "Username / Identifier", example = "admin")
    private String username;

    @Column(name = "email", length = 150)
    @Schema(description = "User email address", example = "admin@ethswitch.et")
    private String email;

    @Column(name = "full_name", length = 150)
    @Schema(description = "User full name", example = "System Administrator")
    private String fullName;

    @Column(name = "role", length = 50)
    @Schema(description = "Assigned user role", example = "ADMIN")
    @Builder.Default
    private String role = "ADMIN";

    @Column(name = "status", length = 20)
    @Schema(description = "User status", example = "ACTIVE")
    @Builder.Default
    private String status = "ACTIVE";

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "last_login_date")
    @Schema(description = "Timestamp of the most recent successful login", example = "2026-10-19T10:00:00")
    private LocalDateTime lastLoginDate;
}
