package com.applicationtracker.applications.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

public class ApplicationUpdateRequest {

    private String fullName;

    @Email
    private String email;


    private String phone;


    private String position;

    private LocalDate appliedDate;

    private String workType;


    private String status;

    private String coverLetter;

    @Min(0)
    private Integer yearsExperience;

    private LocalDate availableFrom;

    private Integer salaryExpectation;

    private String notes;

    private String portfolioUrl;

    private String linkedinUrl;


    private Boolean remoteOk;

    public ApplicationUpdateRequest() {
    }

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
}
