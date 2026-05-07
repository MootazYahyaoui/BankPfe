package org.mounanga.authenticationservice.web;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@Profile("local")
@RequestMapping("/local/users")
public class LocalUserRestController {

    @GetMapping
    public List<LocalUserDTO> users() {
        return List.of(
                new LocalUserDTO("USR-0001", "Yahya", "Alaoui", "yahya", "yahya.alaoui@propsbank.local", "ADMIN", true, LocalDate.of(1998, 4, 14), LocalDateTime.now().minusHours(2)),
                new LocalUserDTO("USR-0002", "Sara", "Bennani", "sara", "sara.bennani@propsbank.local", "USER", true, LocalDate.of(1999, 2, 1), LocalDateTime.now().minusDays(1)),
                new LocalUserDTO("USR-0003", "Mehdi", "Amrani", "mehdi", "mehdi.amrani@propsbank.local", "USER", false, LocalDate.of(1997, 9, 8), null)
        );
    }

    public record LocalUserDTO(String id, String firstname, String lastname, String username, String email,
                               String role, boolean enabled, LocalDate dateOfBirth, LocalDateTime lastLogin) {
    }
}
