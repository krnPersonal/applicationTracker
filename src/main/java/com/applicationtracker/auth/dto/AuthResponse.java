package com.applicationtracker.auth.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";


    public AuthResponse() {

    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

}
