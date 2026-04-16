package com.applicationtracker.user.support;

import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class UserNameBackfillRunner implements CommandLineRunner {
    private final UserRepository userRepository;

    public UserNameBackfillRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        List<User> users = userRepository.findByFirstNameIsNullOrLastNameIsNull();
        for (User user : users) {
            String email = user.getEmail();
            if (email == null || email.isBlank()) {
                continue;
            }
            String localPart = email.split("@", 2)[0];
            if (localPart.isBlank()) {
                continue;
            }
            String[] parts = localPart.split("[._-]+");
            String inferredFirst = parts.length > 0 ? parts[0] : "";
            String inferredLast = parts.length > 1 ? parts[parts.length - 1] : "User";

            if (user.getFirstName() == null || user.getFirstName().isBlank()) {
                user.setFirstName(capitalize(inferredFirst));
            }
            if (user.getLastName() == null || user.getLastName().isBlank()) {
                user.setLastName(capitalize(inferredLast));
            }
        }
        userRepository.saveAll(users);
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "User";
        }
        String trimmed = value.trim();
        if (trimmed.length() == 1) {
            return trimmed.toUpperCase(Locale.ROOT);
        }
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT) +
                trimmed.substring(1).toLowerCase(Locale.ROOT);
    }
}
