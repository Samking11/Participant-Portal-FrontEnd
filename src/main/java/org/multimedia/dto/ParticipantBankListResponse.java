package org.multimedia.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.multimedia.model.ParticipantBank;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response containing list of participant banks")
public class ParticipantBankListResponse {

    @Schema(description = "Operation success status", example = "successfully Loaded")
    private String success;

    @Schema(description = "List of participant banks")
    private List<ParticipantBank> institutions;
}
