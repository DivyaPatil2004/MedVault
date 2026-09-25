package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.entity.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ClinicalNoteResponse {
    private Long id;
    private Long appointmentId;
    private String content;
    private String authorEmail;
    private Role authorRole;
    private LocalDateTime createdAt;
}
