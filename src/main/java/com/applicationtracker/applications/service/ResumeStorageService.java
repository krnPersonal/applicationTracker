package com.applicationtracker.applications.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;


import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;


@Service
public class ResumeStorageService {
    private final Path uploadDir;
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/octet-stream",
            "application/zip");

    public ResumeStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir);
    }

    public StoredResume store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is too large (max 5 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file type");
        }
        try {
            Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename();
            String safeName = "resume";
            if (originalName != null && !originalName.isBlank()) {
                safeName = Paths.get(originalName).getFileName().toString();
            }
            String storageName = UUID.randomUUID() + "_" + safeName;
            Path target = uploadDir.resolve(storageName);

            Files.copy(file.getInputStream(), target);

            return new StoredResume(safeName,
                    storageName,
                    target.toAbsolutePath().toString(),
                    file.getContentType(),
                    file.getSize());

        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store resume", ex);
        }
    }

    public static final class StoredResume {
        private final String originalName;
        private final String storageName;
        private final String path;
        private final String contentType;
        private final long size;

        public StoredResume(String originalName,
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
