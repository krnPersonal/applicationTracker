package com.applicationtracker.user.service;

import com.applicationtracker.auth.service.JwtService;
import com.applicationtracker.user.dto.EmailUpdateRequest;
import com.applicationtracker.user.dto.EmailUpdateResponse;
import com.applicationtracker.user.dto.MeResponse;
import com.applicationtracker.user.dto.PasswordUpdateRequest;
import com.applicationtracker.user.dto.ProfileUpdateRequest;
import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public MeResponse getProfile(String email) {
        User user = getUserOrThrow(email);
        String createdAt = user.getCreatedAt() != null
                ? user.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
                : null;
        String imageUrl = user.getProfileImagePath() != null
                ? "/api/me/profile-image"
                : null;
        return new MeResponse(
                user.getEmail(),
                user.getFirstName(),
                user.getMiddleName(),
                user.getLastName(),
                user.getPhone(),
                user.getTitle(),
                user.getRole(),
                createdAt,
                imageUrl
        );
    }

    public MeResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = getUserOrThrow(email);
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        userRepository.save(user);
        return getProfile(user.getEmail());
    }

    public EmailUpdateResponse updateEmail(String email, EmailUpdateRequest request) {
        User user = getUserOrThrow(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }
        String newEmail = request.getNewEmail().trim();
        if (newEmail.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is unchanged");
        }
        if (userRepository.existsByEmail(newEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        user.setEmail(newEmail);
        userRepository.save(user);
        String token = jwtService.generateToken(newEmail);
        return new EmailUpdateResponse(newEmail, token);
    }

    public void updatePassword(String email, PasswordUpdateRequest request) {
        User user = getUserOrThrow(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
