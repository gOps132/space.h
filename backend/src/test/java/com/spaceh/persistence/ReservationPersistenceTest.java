package com.spaceh.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.spaceh.reservation.Reservation;
import com.spaceh.reservation.ReservationRepository;
import com.spaceh.reservation.ReservationStatus;
import com.spaceh.resource.ResourceStatus;
import com.spaceh.resource.ResourceType;
import com.spaceh.resource.StudyResource;
import com.spaceh.resource.StudyResourceRepository;
import com.spaceh.user.AccountStatus;
import com.spaceh.user.AppUser;
import com.spaceh.user.AppUserRepository;
import com.spaceh.user.UserRole;

@DataJpaTest
@ActiveProfiles("test")
class ReservationPersistenceTest {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private StudyResourceRepository studyResourceRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Test
    void persistsReservationWithUserAndResourceRelationships() {
        AppUser appUser = new AppUser(
                "2024-0001",
                "Ada Lovelace",
                "ada@spaceh.test",
                "{noop}password",
                UserRole.STUDENT,
                AccountStatus.ACTIVE
        );
        appUser = appUserRepository.save(appUser);

        StudyResource studyResource = new StudyResource(
                "Floor 2 - Desk 42",
                ResourceType.INDIVIDUAL_SEAT,
                "Silent Zone",
                2,
                ResourceStatus.AVAILABLE,
                true,
                null,
                false
        );
        studyResource = studyResourceRepository.save(studyResource);

        Reservation reservation = new Reservation(
                appUser,
                studyResource,
                LocalDateTime.of(2026, 4, 24, 9, 0),
                LocalDateTime.of(2026, 4, 24, 11, 0),
                ReservationStatus.PENDING
        );
        reservation = reservationRepository.save(reservation);

        Reservation storedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();

        assertThat(storedReservation.getUser().getUniversityId()).isEqualTo("2024-0001");
        assertThat(storedReservation.getResource().getResourceName()).isEqualTo("Floor 2 - Desk 42");
        assertThat(storedReservation.getStatus()).isEqualTo(ReservationStatus.PENDING);
    }
}
