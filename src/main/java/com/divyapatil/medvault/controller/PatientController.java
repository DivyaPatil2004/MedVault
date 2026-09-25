package com.divyapatil.medvault.controller;

import com.divyapatil.medvault.dto.ClinicalNoteRequest;
import com.divyapatil.medvault.dto.ClinicalNoteResponse;
import com.divyapatil.medvault.dto.PatientDto;
import com.divyapatil.medvault.dto.PatientHistoryResponse;
import com.divyapatil.medvault.entity.Patient;
import com.divyapatil.medvault.entity.Role;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.PatientRepository;
import com.divyapatil.medvault.service.ClinicalNoteService;
import com.divyapatil.medvault.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final ClinicalNoteService clinicalNoteService;
    private final CurrentUserService currentUserService;

    public PatientController(PatientRepository patientRepository,
                             ClinicalNoteService clinicalNoteService,
                             CurrentUserService currentUserService) {
        this.patientRepository = patientRepository;
        this.clinicalNoteService = clinicalNoteService;
        this.currentUserService = currentUserService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Patient createPatient(@Valid @RequestBody PatientDto dto) {
        Patient patient = new Patient();
        patient.setName(dto.getName());
        patient.setEmail(dto.getEmail());
        patient.setDateOfBirth(dto.getDateOfBirth());
        return patientRepository.save(patient);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/{id}/history")
    public PatientHistoryResponse getHistory(@PathVariable Long id) {
        User user = currentUserService.requireUser();
        if (user.getRole() == Role.PATIENT) {
            if (user.getPatient() == null || !user.getPatient().getId().equals(id)) {
                throw new RuntimeException("You can only view your own history");
            }
        }
        return clinicalNoteService.getHistory(id);
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PostMapping("/notes")
    public ClinicalNoteResponse addNote(@Valid @RequestBody ClinicalNoteRequest request) {
        return clinicalNoteService.addNote(request, currentUserService.requireUser());
    }
}
