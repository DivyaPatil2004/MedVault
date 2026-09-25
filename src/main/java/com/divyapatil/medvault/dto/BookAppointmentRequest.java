package com.divyapatil.medvault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookAppointmentRequest {
    private Long patientId;

    @NotNull(message = "Slot id is required")
    private Long slotId;
}
