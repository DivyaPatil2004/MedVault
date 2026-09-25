package com.divyapatil.medvault.repository;

import com.divyapatil.medvault.entity.AppointmentSlot;
import com.divyapatil.medvault.entity.SlotStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM AppointmentSlot s WHERE s.id = :id")
    Optional<AppointmentSlot> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            SELECT s FROM AppointmentSlot s
            JOIN FETCH s.doctor
            WHERE s.doctor.id = :doctorId
              AND s.status = :status
              AND s.startTime >= :from
              AND s.startTime < :to
            ORDER BY s.startTime ASC
            """)
    List<AppointmentSlot> findAvailability(@Param("doctorId") Long doctorId,
                                           @Param("status") SlotStatus status,
                                           @Param("from") LocalDateTime from,
                                           @Param("to") LocalDateTime to);

    @Query("SELECT s FROM AppointmentSlot s JOIN FETCH s.doctor ORDER BY s.startTime ASC")
    List<AppointmentSlot> findAllWithDoctor();
}
