package com.divyapatil.medvault.controller;

import com.divyapatil.medvault.dto.AppointmentSlotDto;
import com.divyapatil.medvault.dto.SlotResponse;
import com.divyapatil.medvault.entity.AppointmentSlot;
import com.divyapatil.medvault.entity.Doctor;
import com.divyapatil.medvault.entity.Role;
import com.divyapatil.medvault.entity.SlotStatus;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.AppointmentSlotRepository;
import com.divyapatil.medvault.repository.DoctorRepository;
import com.divyapatil.medvault.service.CurrentUserService;
import com.divyapatil.medvault.service.DtoMapper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
public class AppointmentSlotController {

    private final AppointmentSlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final CurrentUserService currentUserService;
    private final DtoMapper dtoMapper;

    public AppointmentSlotController(AppointmentSlotRepository slotRepository,
                                     DoctorRepository doctorRepository,
                                     CurrentUserService currentUserService,
                                     DtoMapper dtoMapper) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
        this.currentUserService = currentUserService;
        this.dtoMapper = dtoMapper;
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PostMapping
    public SlotResponse createSlot(@Valid @RequestBody AppointmentSlotDto dto) {
        User user = currentUserService.requireUser();
        Long doctorId = dto.getDoctorId();
        if (user.getRole() == Role.DOCTOR) {
            if (user.getDoctor() == null) {
                throw new RuntimeException("Doctor profile is missing");
            }
            doctorId = user.getDoctor().getId();
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        AppointmentSlot slot = new AppointmentSlot();
        slot.setDoctor(doctor);
        slot.setStartTime(dto.getStartTime());
        slot.setEndTime(dto.getEndTime());
        slot.setStatus(SlotStatus.AVAILABLE);

        return dtoMapper.toSlotResponse(slotRepository.save(slot));
    }

    @GetMapping
    public List<SlotResponse> getAllSlots() {
        return slotRepository.findAllWithDoctor().stream()
                .map(dtoMapper::toSlotResponse)
                .toList();
    }

    @GetMapping("/available")
    public List<SlotResponse> getAvailability(@RequestParam Long doctorId,
                                              @RequestParam(required = false) LocalDateTime from,
                                              @RequestParam(required = false) LocalDateTime to) {
        LocalDateTime start = from != null ? from : LocalDateTime.now();
        LocalDateTime end = to != null ? to : start.plusMonths(3);
        return slotRepository.findAvailability(doctorId, SlotStatus.AVAILABLE, start, end)
                .stream()
                .map(dtoMapper::toSlotResponse)
                .toList();
    }
}
