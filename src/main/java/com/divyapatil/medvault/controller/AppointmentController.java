package com.divyapatil.medvault.controller;

import com.divyapatil.medvault.dto.AppointmentResponse;
import com.divyapatil.medvault.dto.BookAppointmentRequest;
import com.divyapatil.medvault.entity.Role;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.AppointmentRepository;
import com.divyapatil.medvault.service.AppointmentService;
import com.divyapatil.medvault.service.CurrentUserService;
import com.divyapatil.medvault.service.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final CurrentUserService currentUserService;
    private final AppointmentRepository appointmentRepository;
    private final DtoMapper dtoMapper;

    public AppointmentController(AppointmentService appointmentService,
                                 CurrentUserService currentUserService,
                                 AppointmentRepository appointmentRepository,
                                 DtoMapper dtoMapper) {
        this.appointmentService = appointmentService;
        this.currentUserService = currentUserService;
        this.appointmentRepository = appointmentRepository;
        this.dtoMapper = dtoMapper;
    }

    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    @PostMapping("/book")
    public AppointmentResponse bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        User user = currentUserService.requireUser();
        Long patientId = request.getPatientId();
        if (user.getRole() == Role.PATIENT) {
            if (user.getPatient() == null) {
                throw new RuntimeException("Patient profile is missing");
            }
            patientId = user.getPatient().getId();
        }
        if (patientId == null) {
            throw new RuntimeException("Patient id is required");
        }
        return appointmentService.bookAppointment(patientId, request.getSlotId());
    }

    @PostMapping("/{appointmentId}/cancel")
    public AppointmentResponse cancelAppointment(@PathVariable Long appointmentId) {
        User user = currentUserService.requireUser();
        var appointment = appointmentService.requireDetailed(appointmentId);

        if (user.getRole() == Role.PATIENT) {
            if (user.getPatient() == null || !user.getPatient().getId().equals(appointment.getPatient().getId())) {
                throw new RuntimeException("You can only cancel your own appointments");
            }
        }
        return appointmentService.cancelAppointment(appointmentId);
    }

    @GetMapping
    public List<AppointmentResponse> listAppointments() {
        User user = currentUserService.requireUser();
        if (user.getRole() == Role.PATIENT && user.getPatient() != null) {
            return appointmentRepository.findHistoryByPatientId(user.getPatient().getId())
                    .stream()
                    .map(dtoMapper::toAppointmentResponse)
                    .toList();
        }
        if (user.getRole() == Role.DOCTOR && user.getDoctor() != null) {
            return appointmentRepository.findByDoctorId(user.getDoctor().getId())
                    .stream()
                    .map(dtoMapper::toAppointmentResponse)
                    .toList();
        }
        return appointmentRepository.findAllDetailed().stream()
                .map(dtoMapper::toAppointmentResponse)
                .toList();
    }
}
