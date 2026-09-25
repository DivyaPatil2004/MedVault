package com.divyapatil.medvault.service;

import com.divyapatil.medvault.dto.AppointmentResponse;
import com.divyapatil.medvault.dto.ClinicalNoteResponse;
import com.divyapatil.medvault.dto.SlotResponse;
import com.divyapatil.medvault.entity.Appointment;
import com.divyapatil.medvault.entity.AppointmentSlot;
import com.divyapatil.medvault.entity.ClinicalNote;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public SlotResponse toSlotResponse(AppointmentSlot slot) {
        SlotResponse response = new SlotResponse();
        response.setId(slot.getId());
        response.setDoctorId(slot.getDoctor().getId());
        response.setDoctorName(slot.getDoctor().getName());
        response.setSpecialization(slot.getDoctor().getSpecialization());
        response.setStartTime(slot.getStartTime());
        response.setEndTime(slot.getEndTime());
        response.setStatus(slot.getStatus());
        return response;
    }

    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setPatientId(appointment.getPatient().getId());
        response.setPatientName(appointment.getPatient().getName());
        response.setSlotId(appointment.getSlot().getId());
        response.setDoctorId(appointment.getSlot().getDoctor().getId());
        response.setDoctorName(appointment.getSlot().getDoctor().getName());
        response.setStartTime(appointment.getSlot().getStartTime());
        response.setEndTime(appointment.getSlot().getEndTime());
        response.setStatus(appointment.getStatus());
        response.setBookedAt(appointment.getBookedAt());
        return response;
    }

    public ClinicalNoteResponse toNoteResponse(ClinicalNote note) {
        ClinicalNoteResponse response = new ClinicalNoteResponse();
        response.setId(note.getId());
        response.setAppointmentId(note.getAppointment().getId());
        response.setContent(note.getContent());
        response.setAuthorEmail(note.getAuthorEmail());
        response.setAuthorRole(note.getAuthorRole());
        response.setCreatedAt(note.getCreatedAt());
        return response;
    }
}
