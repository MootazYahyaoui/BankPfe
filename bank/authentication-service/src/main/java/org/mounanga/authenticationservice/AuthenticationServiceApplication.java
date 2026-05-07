package org.mounanga.authenticationservice;

import lombok.extern.slf4j.Slf4j;
import org.mounanga.authenticationservice.entity.Role;
import org.mounanga.authenticationservice.entity.User;
import org.mounanga.authenticationservice.enums.Gender;
import org.mounanga.authenticationservice.repository.RoleRepository;
import org.mounanga.authenticationservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@EnableFeignClients
@EnableAsync
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@SpringBootApplication
public class AuthenticationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthenticationServiceApplication.class, args);
    }


    @Bean
    CommandLineRunner commandLineRunner(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!roleRepository.existsBy()) {
                log.info("No roles found");
                try {
                    Role userRole = Role.builder().name("USER").description("USER").build();
                    Role adminRole = Role.builder().name("ADMIN").description("ADMIN").build();
                    Role superAdminRole = Role.builder().name("SUPER_ADMIN").description("SUPER_ADMIN").build();
                    roleRepository.save(userRole);
                    roleRepository.save(adminRole);
                    roleRepository.save(superAdminRole);
                    log.info("Roles 'USER', 'MODERATOR', 'ADMIN' and 'SUPER_ADMIN' created successfully'");
                } catch (Exception e) {
                    log.error("Error while creating roles", e);
                }
            }
            User user = userRepository.findByUsername("admin").orElse(null);
            if (user == null) {
                log.info("No default admin found");
                try {
                    User admin = new User();
                    admin.setCin("ADMIN-CIN-0001");
                    admin.setFirstname("Default");
                    admin.setLastname("Admin");
                    admin.setNationality("Tunisian");
                    admin.setDateOfBirth(LocalDate.of(1994, 1, 22));
                    admin.setPlaceOfBirth("Tunis");
                    admin.setGender(Gender.M);
                    admin.setUsername("admin");
                    admin.setEmail("admin@propsbank.local");
                    admin.setPasswordNeedToBeModified(Boolean.FALSE);
                    admin.setPassword(passwordEncoder.encode("fedi123"));
                    admin.setEnabled(true);
                    User savedUser = userRepository.save(admin);
                    log.info("Default admin created successfully with username 'admin'");
                    Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
                    savedUser.setRoles(List.of(adminRole));
                    User updatedUser = userRepository.save(savedUser);
                    log.info("Default admin updated successfully with roles '{}'", updatedUser.getRoles());
                } catch (Exception e) {
                    log.error("Error while creating default admin user", e);
                }
            }
        };
    }
}
