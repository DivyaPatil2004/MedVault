package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private Role role;
    private Long patientId;
    private Long doctorId;
}
