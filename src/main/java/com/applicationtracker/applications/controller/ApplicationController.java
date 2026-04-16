package com.applicationtracker.applications.controller;

import com.applicationtracker.applications.dto.ApplicationCreateRequest;
import com.applicationtracker.applications.dto.ApplicationResponse;
import com.applicationtracker.applications.dto.ApplicationUpdateRequest;
import com.applicationtracker.applications.entity.JobApplication;
import com.applicationtracker.applications.service.ApplicationReportService;
import com.applicationtracker.applications.service.ApplicationService;
import com.applicationtracker.applications.service.ResumeStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final ApplicationReportService applicationReportService;
    private final ResumeStorageService resumeStorageService;

    public ApplicationController(ApplicationService applicationService,
                                 ApplicationReportService applicationReportService,
                                 ResumeStorageService resumeStorageService) {
        this.applicationService = applicationService;
        this.applicationReportService = applicationReportService;
        this.resumeStorageService = resumeStorageService;
    }

    @PostMapping
    public ApplicationResponse create(@Valid @RequestBody ApplicationCreateRequest request, Authentication authentication) {
        return applicationService.create(request, authentication);
    }
    @GetMapping
    public List<ApplicationResponse> list(Authentication authentication) {
        return applicationService.list(authentication);
    }
    @GetMapping("/{id}")
    public ApplicationResponse getById(@PathVariable("id") Long id, Authentication authentication) {
        return applicationService.getById(id, authentication);
    }
    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable("id") Long id, @Valid @RequestBody ApplicationUpdateRequest request, Authentication authentication) {
        return applicationService.update(id, request, authentication);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id, Authentication authentication) {
        applicationService.delete(id, authentication);
    }
    @GetMapping("/report")
    public ResponseEntity<byte[]> getReport(Authentication authentication) {
        byte[] pdf = applicationReportService.generateUserReport(authentication.getName());
        return  ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=applications-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{id}/resume")
    public ApplicationResponse uploadResume(@PathVariable("id") Long id,
                                            @RequestParam("file")MultipartFile file,
                                            @RequestParam(value="category", required = false) String category,
                                            @RequestParam(value="subcategory", required = false) String subcategory,
                                            Authentication authentication) {
        return applicationService.uploadResume(id,file, category, subcategory, authentication, resumeStorageService);
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<FileSystemResource> downloadResume(@PathVariable("id") Long id,
                                                             Authentication authentication) {
        JobApplication application = applicationService.getOwnedApplication(id, authentication);
        if(application.getResumePath() == null){
            return ResponseEntity.notFound().build();
        }
        File file = new File(application.getResumePath());
        if(!file.exists()){
            return ResponseEntity.notFound().build();
        }
        FileSystemResource resource = new FileSystemResource(file);
        String contentType = application.getResumeContentType() != null ?
                application.getResumeContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + application.getResumeFileName())
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }


}
