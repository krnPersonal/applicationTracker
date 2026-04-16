package com.applicationtracker.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileImageStorageService {
    private final Path uploadDir;
    private static final long MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    public ProfileImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).resolve("profiles");
    }

    public StoredImage store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is too large (max 2 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image type");
        }
        try {
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String safeName = "profile";
            if (originalName != null && !originalName.isBlank()) {
                safeName = Paths.get(originalName).getFileName().toString();
            }
            String storageName = UUID.randomUUID() + "_" + safeName;
            Path target = uploadDir.resolve(storageName);

            Files.copy(file.getInputStream(), target);

            return new StoredImage(
                    safeName,
                    storageName,
                    target.toAbsolutePath().toString(),
                    contentType,
                    file.getSize()
            );
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store profile image", ex);
        }
    }

    public static final class StoredImage {
        private final String originalName;
        private final String storageName;
        private final String path;
        private final String contentType;
        private final long size;

        public StoredImage(String originalName,
                           String storageName,
                           String path,
                           String contentType,
                           long size) {
            this.originalName = originalName;
            this.storageName = storageName;
            this.path = path;
            this.contentType = contentType;
            this.size = size;
        }

        public String originalName() {
            return originalName;
        }

        public String storageName() {
            return storageName;
        }

        public String path() {
            return path;
        }

        public String contentType() {
            return contentType;
        }

        public long size() {
            return size;
        }
    }
}
