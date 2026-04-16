package com.applicationtracker.applications.service;

import com.applicationtracker.applications.dto.ApplicationCreateRequest;
import com.applicationtracker.applications.dto.ApplicationResponse;
import com.applicationtracker.applications.dto.ApplicationUpdateRequest;
import com.applicationtracker.applications.entity.JobApplication;
import com.applicationtracker.applications.repository.JobApplicationRepository;
import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationService(JobApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }
    private User getUserOrThrow(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED , "User not found"));
    }

    private ApplicationResponse toResponse(JobApplication application) {

        ApplicationResponse response = new ApplicationResponse();

        response.setId(application.getId());
        response.setFullName(application.getFullName());
        response.setEmail(application.getEmail());
        response.setPhone(application.getPhone());
        response.setPosition(application.getPosition());
        response.setStatus(application.getStatus());
        response.setCoverLetter(application.getCoverLetter());
        response.setYearsExperience(application.getYearsExperience());
        response.setAvailableFrom(application.getAvailableFrom());
        response.setAppliedDate(application.getAppliedDate());
        response.setWorkType(application.getWorkType());
        response.setSalaryExpectation(application.getSalaryExpectation());
        response.setNotes(application.getNotes());
        response.setPortfolioUrl(application.getPortfolioUrl());
        response.setLinkedinUrl(application.getLinkedinUrl());
        response.setRemoteOk(application.getRemoteOk());
        response.setCreatedAt(application.getCreatedAt());
        response.setResumeFileName(application.getResumeFileName());
        response.setResumeContentType(application.getResumeContentType());
        response.setResumeSize(application.getResumeSize());
        response.setResumeCategory(application.getResumeCategory());
        response.setResumeSubcategory(application.getResumeSubcategory());
        response.setResumeUploadedAt(application.getResumeUploadedAt());
        return response;

    }

    public ApplicationResponse create(ApplicationCreateRequest request, Authentication authentication) {

        User user = getUserOrThrow(authentication.getName());

        JobApplication application = new JobApplication();
        application.setFullName(request.getFullName());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setPosition(request.getPosition());
        application.setAppliedDate(request.getAppliedDate());
        application.setWorkType(request.getWorkType());
        application.setStatus(request.getStatus() !=null ? request.getStatus(): "APPLIED");
        application.setCoverLetter(request.getCoverLetter());
        Integer yearsExperience = request.getYearsExperience();
        application.setYearsExperience(yearsExperience != null ? yearsExperience : 0);
        application.setAvailableFrom(request.getAvailableFrom());
        application.setSalaryExpectation(request.getSalaryExpectation());
        application.setNotes(request.getNotes());
        application.setPortfolioUrl(request.getPortfolioUrl());
        application.setLinkedinUrl(request.getLinkedinUrl());
        application.setRemoteOk(request.getRemoteOk());
        application.setUser(user);

        JobApplication saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    public List<ApplicationResponse> list(Authentication authentication){
        User user = getUserOrThrow(authentication.getName());
       return applicationRepository.findByUserId(user.getId()).stream()
               .map(this::toResponse)
               .collect(Collectors.toList());
    }

    public ApplicationResponse getById(Long id, Authentication authentication) {
        User user = getUserOrThrow(authentication.getName());
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if(!application.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");
        }
        return toResponse(application);
    }

    public ApplicationResponse update (Long id, ApplicationUpdateRequest request, Authentication authentication) {
        User user = getUserOrThrow(authentication.getName());
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if(!application.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");

        }
            if(request.getFullName() != null) application.setFullName(request.getFullName());
            if(request.getEmail() != null)application.setEmail(request.getEmail());
            if(request.getPhone() != null)application.setPhone(request.getPhone());
            if(request.getStatus()!= null)application.setStatus(request.getStatus());
            if(request.getPosition() != null)application.setPosition(request.getPosition());
            if(request.getAppliedDate() != null)application.setAppliedDate(request.getAppliedDate());
            if(request.getWorkType() != null)application.setWorkType(request.getWorkType());
            if(request.getCoverLetter() != null)application.setCoverLetter(request.getCoverLetter());
            if(request.getYearsExperience() != null)application.setYearsExperience(request.getYearsExperience());
            if(request.getAvailableFrom() != null)application.setAvailableFrom(request.getAvailableFrom());
            if(request.getSalaryExpectation() != null)application.setSalaryExpectation(request.getSalaryExpectation());
            if(request.getNotes() != null)application.setNotes(request.getNotes());
            if(request.getPortfolioUrl() != null)application.setPortfolioUrl(request.getPortfolioUrl());
            if(request.getLinkedinUrl() != null)application.setLinkedinUrl(request.getLinkedinUrl());
            if(request.getRemoteOk() != null)application.setRemoteOk(request.getRemoteOk());

        JobApplication saved = applicationRepository.save(application);
        return  toResponse(saved);
    }
    public void delete(Long id, Authentication authentication){
        User user = getUserOrThrow(authentication.getName());
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        if(!application.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");
        }
        applicationRepository.delete(application);
    }

    public ApplicationResponse uploadResume(Long id,
                                            MultipartFile file,
                                            String category, String subcategory,
                                            Authentication authentication,
                                            ResumeStorageService storageService) {
        User user = getUserOrThrow(authentication.getName());
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if(!application.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");
        }
        ResumeStorageService.StoredResume stored = storageService.store(file);

        application.setResumeFileName(stored.originalName());
        application.setResumeStorageName(stored.storageName());
        application.setResumePath(stored.path());
        application.setResumeContentType(stored.contentType());
        application.setResumeSize(stored.size());
        application.setResumeCategory(category);
        application.setResumeSubcategory(subcategory);
        application.setResumeUploadedAt(LocalDateTime.now());

        JobApplication saved = applicationRepository.save(application);
        return toResponse(saved);
    }

    public JobApplication getOwnedApplication(Long id, Authentication authentication) {
        User user = getUserOrThrow(authentication.getName());
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if(!application.getUser().getId().equals(user.getId())){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your application");
        }
        return application;
    }


}
