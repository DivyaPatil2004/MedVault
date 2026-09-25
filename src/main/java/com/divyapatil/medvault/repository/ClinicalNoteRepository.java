package com.divyapatil.medvault.repository;

import com.divyapatil.medvault.entity.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, Long> {
    List<ClinicalNote> findByAppointmentIdOrderByCreatedAtAsc(Long appointmentId);

    List<ClinicalNote> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
