package org.mounanga.accountservice.commands.web;

import org.mounanga.accountservice.commands.dto.CustomerExistResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "CUSTOMER-SERVICE",
        url = "${customer.service.url:http://localhost:8886}"
)
public interface CustomerRestClient {

    @GetMapping("/bank/customers/get/{id}")
    CustomerExistResponseDTO checkCustomerExist(@PathVariable String id);
}
