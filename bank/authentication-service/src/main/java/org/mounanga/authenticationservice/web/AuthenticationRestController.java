package org.mounanga.authenticationservice.web;

import org.mounanga.authenticationservice.dto.LoginRequestDTO;
import org.mounanga.authenticationservice.dto.LoginResponseDTO;
import org.mounanga.authenticationservice.dto.RegistrationRequestDTO;
import org.mounanga.authenticationservice.dto.CustomerRequestDTO;
import org.mounanga.authenticationservice.dto.UserRequestDTO;
import org.mounanga.authenticationservice.dto.UserResponseDTO;
import org.mounanga.authenticationservice.dto.UserRoleRequestDTO;
import org.mounanga.authenticationservice.service.AuthenticationService;
import org.mounanga.authenticationservice.service.UserService;
import feign.FeignException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authentication")
public class AuthenticationRestController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final CustomerRestClient customerRestClient;

    public AuthenticationRestController(
            AuthenticationService authenticationService,
            UserService userService,
            CustomerRestClient customerRestClient
    ) {
        this.authenticationService = authenticationService;
        this.userService = userService;
        this.customerRestClient = customerRestClient;
    }

    @PostMapping("/login")
    public LoginResponseDTO authenticate(@RequestBody LoginRequestDTO requestDTO) {
        return authenticationService.authenticate(requestDTO);
    }

    @PostMapping("/signup/user")
    public UserResponseDTO signUpUser(@RequestBody RegistrationRequestDTO request) {
        return createWithRole(request, "USER");
    }

    private UserResponseDTO createWithRole(RegistrationRequestDTO request, String roleName) {
        UserRequestDTO userRequest = new UserRequestDTO(
                request.firstname(),
                request.lastname(),
                request.placeOfBirth(),
                request.dateOfBirth(),
                request.nationality(),
                request.gender(),
                request.cin(),
                request.email(),
                request.username(),
                request.password()
        );
        UserResponseDTO created = userService.createUser(userRequest);
        UserResponseDTO withRole = userService.addRoleToUser(new UserRoleRequestDTO(created.getUsername(), roleName));
        if (Boolean.FALSE.equals(withRole.getEnabled())) {
            withRole = userService.updateUserStatus(withRole.getId());
        }

        try {
            customerRestClient.createCustomer(new CustomerRequestDTO(
                    request.firstname(),
                    request.lastname(),
                    request.placeOfBirth(),
                    request.dateOfBirth(),
                    request.nationality(),
                    request.gender(),
                    request.cin(),
                    request.email()
            ));
        } catch (FeignException e) {
            userService.deleteUserById(withRole.getId());
            throw new IllegalStateException("Customer profile creation failed: " + e.getMessage(), e);
        }
        return withRole;
    }
}
