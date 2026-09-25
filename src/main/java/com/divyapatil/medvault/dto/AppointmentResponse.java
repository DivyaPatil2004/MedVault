package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.entity.AppointmentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long slotId;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private LocalDateTime bookedAt;
    private List<ClinicalNoteResponse> notes = new ArrayList<>();
}
