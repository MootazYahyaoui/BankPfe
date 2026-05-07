package org.mounanga.accountservice.commands.util.generator.implementation;

import org.mounanga.accountservice.commands.util.generator.IdGenerator;
import org.springframework.stereotype.Service;

@Service
public class AccountIdGenerator implements IdGenerator {

    private final CounterRepository counterRepository;

    public AccountIdGenerator(CounterRepository counterRepository) {
        this.counterRepository = counterRepository;
    }

    @Override
    public String autoGenerateId() {
        Counter counter = counterRepository.save(new Counter());
        return "ACC-%06d".formatted(counter.getId());
    }
}
