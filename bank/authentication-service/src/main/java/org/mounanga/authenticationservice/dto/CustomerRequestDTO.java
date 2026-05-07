package org.mounanga.authenticationservice.dto;

import org.mounanga.authenticationservice.enums.Gender;

import java.time.LocalDate;

public record CustomerRequestDTO(
        String firstname,
        String lastname,
        String placeOfBirth,
        LocalDate dateOfBirth,
        String nationality,
        Gender gender,
        String cin,
        String email
) {
}
