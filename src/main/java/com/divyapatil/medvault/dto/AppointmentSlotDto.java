package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.validation.ValidSlotTimeRange;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@ValidSlotTimeRange
public class AppointmentSlotDto {

    @NotNull(message = "Doctor id is required")
    private Long doctorId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;
}
