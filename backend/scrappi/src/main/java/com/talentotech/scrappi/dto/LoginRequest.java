package com.talentotech.scrappi.dto;

public class LoginRequest {
    private String identifier; // Aquí llegará o el documento (100340) o el username ("pepito")
    private String password;

    // Constructores
    public LoginRequest() {}

    // Getters y Setters (Súper importantes para que Spring pueda leer el JSON)
    public String getIdentifier() {
        return identifier;
    }
    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}