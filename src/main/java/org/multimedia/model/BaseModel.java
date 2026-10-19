package org.multimedia.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@MappedSuperclass
public abstract class BaseModel {

    @Schema(description = "User identifier who created the record", example = "1")
    @Column(name = "created_by")
    private Long createdBy;

    @Schema(description = "Record creation timestamp", example = "2026-10-19T10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Schema(description = "User identifier who last modified the record", example = "1")
    @Column(name = "modified_by")
    private Long modifiedBy;

    @Schema(description = "Record last modification timestamp", example = "2026-10-19T10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "modified_date")
    private LocalDateTime modifiedDate;

    @PrePersist
    protected void onCreate() {
        if (this.createdDate == null) {
            this.createdDate = LocalDateTime.now();
        }
        if (this.modifiedDate == null) {
            this.modifiedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = LocalDateTime.now();
    }
}
