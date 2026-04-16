package com.applicationtracker.user.controller;

import com.applicationtracker.user.dto.EmailUpdateRequest;
import com.applicationtracker.user.dto.EmailUpdateResponse;
import com.applicationtracker.user.dto.MeResponse;
import com.applicationtracker.user.dto.PasswordUpdateRequest;
import com.applicationtracker.user.dto.ProfileUpdateRequest;
import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import com.applicationtracker.user.service.ProfileImageStorageService;
import com.applicationtracker.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final ProfileImageStorageService profileImageStorageService;

    public UserController(UserService userService,
                          UserRepository userRepository,
                          ProfileImageStorageService profileImageStorageService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.profileImageStorageService = profileImageStorageService;
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication){
        return userService.getProfile(authentication.getName());
    }

    @PutMapping("/me")
    public MeResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                    Authentication authentication) {
        return userService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/me/email")
    public EmailUpdateResponse updateEmail(@Valid @RequestBody EmailUpdateRequest request,
                                           Authentication authentication) {
        return userService.updateEmail(authentication.getName(), request);
    }

    @PutMapping("/me/password")
    public void updatePassword(@Valid @RequestBody PasswordUpdateRequest request,
                               Authentication authentication) {
        userService.updatePassword(authentication.getName(), request);
    }

    @PostMapping("/me/profile-image")
    public MeResponse uploadProfileImage(@RequestParam("file") MultipartFile file,
                                         Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();
        ProfileImageStorageService.StoredImage stored = profileImageStorageService.store(file);
        user.setProfileImageFileName(stored.originalName());
        user.setProfileImageStorageName(stored.storageName());
        user.setProfileImagePath(stored.path());
        user.setProfileImageContentType(stored.contentType());
        user.setProfileImageSize(stored.size());
        userRepository.save(user);
        return userService.getProfile(user.getEmail());
    }

    @GetMapping("/me/profile-image")
    public ResponseEntity<FileSystemResource> downloadProfileImage(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();
        if (user.getProfileImagePath() == null) {
            return ResponseEntity.notFound().build();
        }
        FileSystemResource resource = new FileSystemResource(user.getProfileImagePath());
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        String contentType = user.getProfileImageContentType() != null
                ? user.getProfileImageContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + user.getProfileImageFileName())
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

}
