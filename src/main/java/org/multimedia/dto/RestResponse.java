package org.multimedia.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API response wrapper with success/error status and data payload")
public class RestResponse {

    public static final String SUCCESS = "success";
    public static final String ERROR = "error";

    @Schema(description = "Response status code or message")
    private String status;

    @Schema(description = "Response message")
    private String message;

    @Schema(description = "Dynamic response payload data")
    private Map<String, Object> data = new HashMap<>();

    public RestResponse(String key, Object value) {
        this.data.put(key, value);
    }

    @JsonAnySetter
    public void addData(String key, Object value) {
        this.data.put(key, value);
    }

    @JsonAnyGetter
    public Map<String, Object> getData() {
        return this.data;
    }

    @JsonIgnore
    public String getSuccess() {
        Object val = this.data.get(SUCCESS);
        return val != null ? val.toString() : null;
    }

    @JsonIgnore
    public String getError() {
        Object val = this.data.get(ERROR);
        return val != null ? val.toString() : null;
    }

    public static ResponseEntity<RestResponse> success(String message) {
        RestResponse resp = new RestResponse(SUCCESS, message);
        resp.setStatus("SUCCESS");
        resp.setMessage(message);
        return ResponseEntity.ok(resp);
    }

    public static ResponseEntity<RestResponse> success(String message, String dataKey, Object dataValue) {
        RestResponse resp = new RestResponse(SUCCESS, message);
        resp.setStatus("SUCCESS");
        resp.setMessage(message);
        resp.addData(dataKey, dataValue);
        return ResponseEntity.ok(resp);
    }

    public static ResponseEntity<RestResponse> error(String errorMessage, HttpStatus httpStatus) {
        RestResponse resp = new RestResponse(ERROR, errorMessage);
        resp.setStatus("ERROR");
        resp.setMessage(errorMessage);
        return ResponseEntity.status(httpStatus).body(resp);
    }
}
