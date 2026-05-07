package org.mounanga.accountservice.commands.util.validation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountEmailCustomerIdRepository extends JpaRepository<AccountEmailCustomerId, String> {
    AccountEmailCustomerId findByEmail(String email);

    AccountEmailCustomerId findByCustomerId(String customerId);
}
