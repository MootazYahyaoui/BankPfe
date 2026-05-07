package org.mounanga.customerservice.config;

import org.mounanga.customerservice.entity.Customer;
import org.mounanga.customerservice.enums.Gender;
import org.mounanga.customerservice.repository.CustomerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDate;
import java.util.List;

@Configuration
@Profile("local")
@ConditionalOnProperty(name = "app.seed.customers.enabled", havingValue = "true")
public class LocalDataSeeder {

    @Bean
    CommandLineRunner seedCustomers(CustomerRepository customerRepository) {
        return args -> {
            if (customerRepository.count() > 0) {
                return;
            }

            List<Customer> seed = List.of(
                    customer("Yahya", "Alaoui", "Casablanca", LocalDate.of(1998, 4, 14), "MA", Gender.M, "CIN000001", "yahya.alaoui@propsbank.local"),
                    customer("Sara", "Bennani", "Rabat", LocalDate.of(1999, 2, 1), "MA", Gender.F, "CIN000002", "sara.bennani@propsbank.local"),
                    customer("Mehdi", "Amrani", "Marrakech", LocalDate.of(1997, 9, 8), "MA", Gender.M, "CIN000003", "mehdi.amrani@propsbank.local"),
                    customer("Salma", "El Idrissi", "Fes", LocalDate.of(2000, 1, 23), "MA", Gender.F, "CIN000004", "salma.idrissi@propsbank.local"),
                    customer("Anas", "Chakir", "Agadir", LocalDate.of(1996, 11, 30), "MA", Gender.M, "CIN000005", "anas.chakir@propsbank.local"),
                    customer("Ikram", "Tazi", "Meknes", LocalDate.of(2001, 5, 17), "MA", Gender.F, "CIN000006", "ikram.tazi@propsbank.local")
            );

            customerRepository.saveAll(seed);
        };
    }

    private Customer customer(String firstname,
                              String lastname,
                              String placeOfBirth,
                              LocalDate dateOfBirth,
                              String nationality,
                              Gender gender,
                              String cin,
                              String email) {
        Customer c = new Customer();
        c.setFirstname(firstname);
        c.setLastname(lastname);
        c.setPlaceOfBirth(placeOfBirth);
        c.setDateOfBirth(dateOfBirth);
        c.setNationality(nationality);
        c.setGender(gender);
        c.setCin(cin);
        c.setEmail(email);
        return c;
    }
}
