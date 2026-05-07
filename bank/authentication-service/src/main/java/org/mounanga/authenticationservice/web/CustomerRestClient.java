package org.mounanga.authenticationservice.web;

import org.mounanga.authenticationservice.dto.CustomerRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "CUSTOMER-SERVICE",
        url = "${customer.service.url:http://localhost:8886}",
        path = "/bank/customers"
)
public interface CustomerRestClient {

    @PostMapping("/create")
    void createCustomer(@RequestBody CustomerRequestDTO request);
}
