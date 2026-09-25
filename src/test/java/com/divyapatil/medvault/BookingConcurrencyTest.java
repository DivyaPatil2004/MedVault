package com.divyapatil.medvault;

import com.divyapatil.medvault.entity.*;
import com.divyapatil.medvault.repository.*;
import com.divyapatil.medvault.service.AppointmentService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class BookingConcurrencyTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentSlotRepository slotRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Long slotId;

    private final List<Long> patientIds = new ArrayList<>();


    @BeforeEach
    void setup() {

        // Create Doctor
        Doctor doctor = new Doctor();
        doctor.setName("Dr. Test");
        doctor.setSpecialization("General");
        doctor.setEmail("test@medvault.com");

        doctor = doctorRepository.save(doctor);


        // Create ONE appointment slot
        AppointmentSlot slot = new AppointmentSlot();

        slot.setDoctor(doctor);
        slot.setStartTime(LocalDateTime.now().plusDays(1));
        slot.setEndTime(
                LocalDateTime.now()
                        .plusDays(1)
                        .plusMinutes(30)
        );

        slot.setStatus(SlotStatus.AVAILABLE);

        slot = slotRepository.save(slot);

        slotId = slot.getId();


        // Create 10 different patients
        for (int i = 1; i <= 10; i++) {

            Patient patient = new Patient();

            patient.setName("Test Patient " + i);
            patient.setEmail(
                    "patient" + i + "@medvault.com"
            );

            patient = patientRepository.save(patient);

            patientIds.add(patient.getId());
        }
    }


    @AfterEach
    void cleanup() {

        appointmentRepository.deleteAll();

        slotRepository.deleteAll();

        patientRepository.deleteAll();

        doctorRepository.deleteAll();
    }


    @Test
    void onlyOnePatientShouldBookSameSlot()
            throws InterruptedException {

        int patientCount = 10;

        ExecutorService executor =
                Executors.newFixedThreadPool(patientCount);

        CountDownLatch latch =
                new CountDownLatch(patientCount);

        AtomicInteger successCount =
                new AtomicInteger(0);

        AtomicInteger failureCount =
                new AtomicInteger(0);


        // 10 patients try to book the SAME slot
        for (Long patientId : patientIds) {

            executor.submit(() -> {

                try {

                    appointmentService.bookAppointment(
                            patientId,
                            slotId
                    );

                    successCount.incrementAndGet();

                    System.out.println(
                            "SUCCESS - Patient ID: "
                                    + patientId
                    );

                } catch (Exception e) {

                    failureCount.incrementAndGet();

                    System.out.println(
                            "FAILED - Patient ID: "
                                    + patientId
                                    + " | "
                                    + e.getMessage()
                    );

                } finally {

                    latch.countDown();
                }
            });
        }


        // Wait for all 10 booking attempts
        latch.await();

        executor.shutdown();


        // Print results
        System.out.println(
                "================================="
        );

        System.out.println(
                "Successful bookings: "
                        + successCount.get()
        );

        System.out.println(
                "Failed bookings: "
                        + failureCount.get()
        );


        // Verify exactly one booking succeeded
        assertEquals(
                1,
                successCount.get(),
                "Only one patient should book the slot"
        );


        // Verify remaining nine failed
        assertEquals(
                9,
                failureCount.get(),
                "Nine patients should fail"
        );


        // Verify database
        long appointmentCount =
                appointmentRepository.count();

        assertEquals(
                1,
                appointmentCount,
                "Only one appointment should exist in database"
        );
    }
}