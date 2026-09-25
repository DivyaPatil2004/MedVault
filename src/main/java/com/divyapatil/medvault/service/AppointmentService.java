package com.divyapatil.medvault.service;

import com.divyapatil.medvault.dto.AppointmentResponse;
import com.divyapatil.medvault.entity.*;
import com.divyapatil.medvault.repository.AppointmentRepository;
import com.divyapatil.medvault.repository.AppointmentSlotRepository;
import com.divyapatil.medvault.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AppointmentService {

    private final AppointmentSlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DtoMapper dtoMapper;

    public AppointmentService(AppointmentSlotRepository slotRepository,
                              AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DtoMapper dtoMapper) {
        this.slotRepository = slotRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public AppointmentResponse bookAppointment(Long patientId, Long slotId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        AppointmentSlot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new RuntimeException("Slot is already booked");
        }

        slot.setStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setSlot(slot);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setBookedAt(LocalDateTime.now());

        return dtoMapper.toAppointmentResponse(appointmentRepository.save(appointment));
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public AppointmentResponse cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findDetailedById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        AppointmentSlot slot = appointment.getSlot();
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        return dtoMapper.toAppointmentResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Appointment requireDetailed(Long appointmentId) {
        return appointmentRepository.findDetailedById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}
