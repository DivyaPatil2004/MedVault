package com.divyapatil.medvault.dto;

import com.divyapatil.medvault.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private Long id;
    private String email;
    private Role role;
}
