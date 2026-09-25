package com.divyapatil.medvault.controller;

import com.divyapatil.medvault.dto.DoctorDto;
import com.divyapatil.medvault.entity.Doctor;
import com.divyapatil.medvault.entity.Role;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.DoctorRepository;
import com.divyapatil.medvault.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorController(DoctorRepository doctorRepository,
                            UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Doctor createDoctor(@Valid @RequestBody DoctorDto dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        Doctor doctor = new Doctor();
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setSpecialization(dto.getSpecialization());
        doctor = doctorRepository.save(doctor);

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.DOCTOR);
        user.setDoctor(doctor);
        userRepository.save(user);

        return doctor;
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
