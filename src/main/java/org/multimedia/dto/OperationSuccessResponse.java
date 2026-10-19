package org.multimedia.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Generic operation success response")
public class OperationSuccessResponse {

    @Schema(description = "Success message", example = "successfully Added Commercial Bank of Ethiopia")
    private String success;
}
