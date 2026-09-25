package com.divyapatil.medvault.repository;

import com.divyapatil.medvault.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.slot s
            JOIN FETCH s.doctor
            WHERE a.patient.id = :patientId
            ORDER BY a.bookedAt DESC
            """)
    List<Appointment> findHistoryByPatientId(@Param("patientId") Long patientId);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.slot s
            JOIN FETCH s.doctor
            WHERE s.doctor.id = :doctorId
            ORDER BY s.startTime DESC
            """)
    List<Appointment> findByDoctorId(@Param("doctorId") Long doctorId);

    @Query("""
            SELECT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.slot s
            JOIN FETCH s.doctor
            WHERE a.id = :id
            """)
    Optional<Appointment> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.slot s
            JOIN FETCH s.doctor
            ORDER BY a.bookedAt DESC
            """)
    List<Appointment> findAllDetailed();
}
