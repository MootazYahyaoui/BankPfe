package org.mounanga.accountservice.queries.web;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@Profile("local")
@RequestMapping("/local/accounts")
public class LocalAccountRestController {

    @GetMapping
    public List<LocalAccountDTO> accounts() {
        return List.of(
                new LocalAccountDTO("ACC-0001", "Yahya Alaoui", "CIN000001", "TND", "ACTIVATED", new BigDecimal("18500.00"), LocalDateTime.now().minusDays(8)),
                new LocalAccountDTO("ACC-0002", "Sara Bennani", "CIN000002", "TND", "ACTIVATED", new BigDecimal("12400.50"), LocalDateTime.now().minusDays(6)),
                new LocalAccountDTO("ACC-0003", "Mehdi Amrani", "CIN000003", "TND", "SUSPENDED", new BigDecimal("3200.00"), LocalDateTime.now().minusDays(4)),
                new LocalAccountDTO("ACC-0004", "Salma El Idrissi", "CIN000004", "TND", "CREATED", BigDecimal.ZERO, LocalDateTime.now().minusDays(1))
        );
    }

    @GetMapping("/operations")
    public List<LocalOperationDTO> operations() {
        return List.of(
                new LocalOperationDTO("OP-1001", "ACC-0001", "CREDIT", new BigDecimal("5000.00"), "Depot initial", LocalDateTime.now().minusDays(8)),
                new LocalOperationDTO("OP-1002", "ACC-0001", "DEBIT", new BigDecimal("450.00"), "Retrait guichet", LocalDateTime.now().minusDays(3)),
                new LocalOperationDTO("OP-1003", "ACC-0002", "CREDIT", new BigDecimal("2400.50"), "Virement salaire", LocalDateTime.now().minusDays(2)),
                new LocalOperationDTO("OP-1004", "ACC-0003", "DEBIT", new BigDecimal("300.00"), "Paiement carte", LocalDateTime.now().minusDays(1))
        );
    }

    public record LocalAccountDTO(String id, String customerName, String cin, String currency, String status,
                                  BigDecimal balance, LocalDateTime createdDate) {
    }

    public record LocalOperationDTO(String id, String accountId, String type, BigDecimal amount, String description,
                                    LocalDateTime dateTime) {
    }
}
