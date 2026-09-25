package com.divyapatil.medvault.service;

import com.divyapatil.medvault.dto.AppointmentResponse;
import com.divyapatil.medvault.dto.ClinicalNoteRequest;
import com.divyapatil.medvault.dto.ClinicalNoteResponse;
import com.divyapatil.medvault.dto.PatientHistoryResponse;
import com.divyapatil.medvault.entity.Appointment;
import com.divyapatil.medvault.entity.ClinicalNote;
import com.divyapatil.medvault.entity.Patient;
import com.divyapatil.medvault.entity.User;
import com.divyapatil.medvault.repository.AppointmentRepository;
import com.divyapatil.medvault.repository.ClinicalNoteRepository;
import com.divyapatil.medvault.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClinicalNoteService {

    private final ClinicalNoteRepository clinicalNoteRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DtoMapper dtoMapper;

    public ClinicalNoteService(ClinicalNoteRepository clinicalNoteRepository,
                               AppointmentRepository appointmentRepository,
                               PatientRepository patientRepository,
                               DtoMapper dtoMapper) {
        this.clinicalNoteRepository = clinicalNoteRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.dtoMapper = dtoMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public ClinicalNoteResponse addNote(ClinicalNoteRequest request, User author) {
        Appointment appointment = appointmentRepository.findDetailedById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        ClinicalNote note = new ClinicalNote();
        note.setAppointment(appointment);
        note.setPatient(appointment.getPatient());
        note.setContent(request.getContent().trim());
        note.setAuthorEmail(author.getEmail());
        note.setAuthorRole(author.getRole());
        note.setCreatedAt(LocalDateTime.now());

        return dtoMapper.toNoteResponse(clinicalNoteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public PatientHistoryResponse getHistory(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<Appointment> appointments = appointmentRepository.findHistoryByPatientId(patientId);
        Map<Long, List<ClinicalNote>> notesByAppointment = clinicalNoteRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .collect(Collectors.groupingBy(note -> note.getAppointment().getId()));

        PatientHistoryResponse history = new PatientHistoryResponse();
        history.setPatientId(patient.getId());
        history.setName(patient.getName());
        history.setEmail(patient.getEmail());
        history.setAppointments(appointments.stream().map(appointment -> {
            AppointmentResponse item = dtoMapper.toAppointmentResponse(appointment);
            item.setNotes(notesByAppointment.getOrDefault(appointment.getId(), List.of())
                    .stream()
                    .map(dtoMapper::toNoteResponse)
                    .toList());
            return item;
        }).toList());
        return history;
    }
}
