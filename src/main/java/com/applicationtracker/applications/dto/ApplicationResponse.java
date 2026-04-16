package com.applicationtracker.applications.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String position;
    private LocalDate appliedDate;
    private String workType;
    private String status;
    private String coverLetter;
    private Integer yearsExperience;
    private LocalDate availableFrom;
    private Integer salaryExpectation;
    private String notes;
    private String portfolioUrl;
    private String linkedinUrl;
    private Boolean remoteOk;
    private LocalDateTime createdAt;
    private String resumeFileName;
    private String resumeContentType;
    private Long resumeSize;
    private String resumeCategory;
    private String resumeSubcategory;
    private LocalDateTime resumeUploadedAt;

    public ApplicationResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {this.id = id;}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public LocalDate getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDate appliedDate) {
        this.appliedDate = appliedDate;
    }

    public String getWorkType() {
        return workType;
    }

    public void setWorkType(String workType) {
        this.workType = workType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }

    public Integer getSalaryExpectation() {
        return salaryExpectation;
    }

    public void setSalaryExpectation(Integer salaryExpectation) {
        this.salaryExpectation = salaryExpectation;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public Boolean getRemoteOk() {
        return remoteOk;
    }

    public void setRemoteOk(Boolean remoteOk) {
        this.remoteOk = remoteOk;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getResumeFileName(){return resumeFileName;}

    public void setResumeFileName(String resumeFileName){ this.resumeFileName = resumeFileName;}

    public String getResumeContentType(){return resumeContentType;}

    public void setResumeContentType (String resumeContentType){this.resumeContentType = resumeContentType;}

    public Long getResumeSize() {return resumeSize; }

    public void setResumeSize(Long resumeSize) {this.resumeSize = resumeSize;}

    public String getResumeCategory() {return resumeCategory;}

    public void setResumeCategory(String resumeCategory) {this.resumeCategory = resumeCategory;}

    public String getResumeSubcategory() {return resumeSubcategory;}

    public void setResumeSubcategory(String resumeSubcategory) {this.resumeSubcategory = resumeSubcategory;}

    public LocalDateTime getResumeUploadedAt() {return resumeUploadedAt;}

    public void setResumeUploadedAt(LocalDateTime resumeUploadedAt) {this.resumeUploadedAt = resumeUploadedAt;}


}
