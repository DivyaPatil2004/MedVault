package com.divyapatil.medvault.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class PatientHistoryResponse {
    private Long patientId;
    private String name;
    private String email;
    private List<AppointmentResponse> appointments = new ArrayList<>();
}
