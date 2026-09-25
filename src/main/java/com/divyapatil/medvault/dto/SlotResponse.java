package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.entity.SlotStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SlotResponse {
    private Long id;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private SlotStatus status;
}
