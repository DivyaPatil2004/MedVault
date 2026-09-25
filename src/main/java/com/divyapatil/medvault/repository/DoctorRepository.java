package com.divyapatil.medvault.repository;

import com.divyapatil.medvault.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor,Long> {
}
