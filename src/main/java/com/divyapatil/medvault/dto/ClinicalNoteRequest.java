package com.divyapatil.medvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClinicalNoteRequest {
    @NotNull(message = "Appointment id is required")
    private Long appointmentId;

    @NotBlank(message = "Note content is required")
    private String content;
}
