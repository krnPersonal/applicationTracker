package com.applicationtracker.user.dto;

public class MeResponse {
    private String email;
    private String firstName;
    private String middleName;
    private String lastName;
    private String phone;
    private String title;
    private String role;
    private String createdAt;
    private String profileImageUrl;
    public MeResponse(){

    }
    public MeResponse(String email){
        this.email = email;
    }
    public MeResponse(String email, String firstName, String middleName, String lastName, String phone, String title, String role, String createdAt, String profileImageUrl){
        this.email = email;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.phone = phone;
        this.title = title;
        this.role = role;
        this.createdAt = createdAt;
        this.profileImageUrl = profileImageUrl;
    }
    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
}
