package com.divyapatil.medvault.repository;

import com.divyapatil.medvault.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
