package com.applicationtracker.applications.entity;

import com.applicationtracker.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @Email
    @NotBlank
    @Column(nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @NotBlank
    @Column(nullable = false)
    private String position;

    @Column(nullable = true)
    private LocalDate appliedDate;

    @Column(nullable = true)
    private String workType;

    @NotBlank
    @Column(nullable = false)
    private String status;

    @Column(nullable = true)
    private String coverLetter;

    @Min(0)
    @Column(nullable = false)
    private Integer yearsExperience;

    @Column(nullable = true)
    private LocalDate availableFrom;

    @Column(nullable = true)
    private Integer salaryExpectation;

    @Column(nullable = true)
    private String notes;

    @Column(nullable = true)
    private String portfolioUrl;

    @Column(nullable = true)
    private String linkedinUrl;

    @NotNull
    @Column(nullable = false)
    private Boolean remoteOk;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @JoinColumn(name = "user_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = true)
    private String resumeFileName;

    @Column(nullable = true)
    private String resumeStorageName;

    @Column(nullable = true)
    private String resumePath;

    @Column(nullable = true)
    private String resumeContentType;

    @Column(nullable = true)
    private Long resumeSize;

    @Column(nullable = true)
    private String resumeCategory;

    @Column(nullable = true)
    private String resumeSubcategory;

    @Column(nullable = true)
    private LocalDateTime resumeUploadedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public JobApplication() {

    };

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getResumeFileName() {return resumeFileName;}

    public void setResumeFileName(String resumeFileName) {this.resumeFileName = resumeFileName;}

    public String getResumeStorageName(){return resumeStorageName;}

    public void setResumeStorageName(String resumeStorageName) {this.resumeStorageName = resumeStorageName;}

    public String getResumePath(){return resumePath;}

    public void setResumePath(String resumePath){this.resumePath = resumePath;}

    public String getResumeContentType(){return resumeContentType;}

    public void setResumeContentType(String resumeContentType){this.resumeContentType = resumeContentType;}

    public Long getResumeSize() {return resumeSize;}

    public void setResumeSize(Long resumeSize) {this.resumeSize = resumeSize;}

    public String getResumeCategory(){return resumeCategory;}

    public void setResumeCategory(String resumeCategory){this.resumeCategory = resumeCategory;}

    public String getResumeSubcategory(){return resumeSubcategory;}

    public void setResumeSubcategory(String resumeSubcategory){this.resumeSubcategory = resumeSubcategory;}

    public LocalDateTime getResumeUploadedAt() {return resumeUploadedAt;}

    public void setResumeUploadedAt(LocalDateTime resumeUploadedAt) {this.resumeUploadedAt = resumeUploadedAt;}


}
