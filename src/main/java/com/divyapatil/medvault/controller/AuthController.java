package com.divyapatil.medvault.controller;

import com.divyapatil.medvault.dto.CreateStaffRequest;
import com.divyapatil.medvault.dto.LoginRequest;
import com.divyapatil.medvault.dto.LoginResponse;
import com.divyapatil.medvault.dto.RegisterRequest;
import com.divyapatil.medvault.dto.UserResponse;
import com.divyapatil.medvault.entity.Patient;
import com.divyapatil.medvault.entity.Role;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.PatientRepository;
import com.divyapatil.medvault.repository.UserRepository;
import com.divyapatil.medvault.security.JwtService;
import com.divyapatil.medvault.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;

    public AuthController(UserRepository userRepository,
                          PatientRepository patientRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        Patient patient = new Patient();
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient = patientRepository.save(patient);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);
        user.setPatient(patient);

        return toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-staff")
    public UserResponse createStaff(@Valid @RequestBody CreateStaffRequest request) {
        if (request.getRole() == Role.PATIENT) {
            throw new RuntimeException("Use /api/auth/register for patients");
        }
        if (request.getRole() == Role.DOCTOR) {
            throw new RuntimeException("Use /api/doctors to create doctor accounts");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return toUserResponse(userRepository.save(user));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPatientId(user.getPatient() != null ? user.getPatient().getId() : null);
        response.setDoctorId(user.getDoctor() != null ? user.getDoctor().getId() : null);
        return response;
    }

    @GetMapping("/me")
    public LoginResponse me() {
        User user = currentUserService.requireUser();
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPatientId(user.getPatient() != null ? user.getPatient().getId() : null);
        response.setDoctorId(user.getDoctor() != null ? user.getDoctor().getId() : null);
        return response;
    }

    private UserResponse toUserResponse(User saved) {
        UserResponse response = new UserResponse();
        response.setId(saved.getId());
        response.setEmail(saved.getEmail());
        response.setRole(saved.getRole());
        return response;
    }
}
