package org.mounanga.authenticationservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.mounanga.authenticationservice.enums.Gender;

import java.time.LocalDate;

public record RegistrationRequestDTO(
        @NotBlank(message = "field 'firstname' is mandatory : it can not be blank")
        String firstname,
        @NotBlank(message = "field 'lastname' is mandatory : it can not be blank")
        String lastname,
        @NotBlank(message = "field 'placeOfBirth' is mandatory : it can not be blank")
        String placeOfBirth,
        @NotNull(message = "field 'dateOfBirth' is mandatory : it can not be null")
        LocalDate dateOfBirth,
        @NotBlank(message = "field 'nationality' is mandatory : it can not be blank")
        String nationality,
        @NotNull(message = "field 'gender' is mandatory : it can not be null")
        Gender gender,
        @NotBlank(message = "field 'cin' is mandatory : it can not be blank")
        String cin,
        @NotBlank(message = "field 'email' is mandatory : it can not be blank")
        @Email(message = "field 'email' must be well formated as 'example@mail.com'")
        String email,
        @NotBlank(message = "field 'username' is mandatory : it can not be blank")
        String username,
        @NotBlank(message = "field 'password' is mandatory : it can not be blank")
        String password
) {
}
