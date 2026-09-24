package com.talentotech.scrappi.dto;

public class WorkLogCheckoutRequest {

    private Double longitudeOut;
    private Double latitudeOut;

    public Double getLongitudeOut() {
        return longitudeOut;
    }

    public void setLongitudeOut(Double longitudeOut) {
        this.longitudeOut = longitudeOut;
    }

    public Double getLatitudeOut() {
        return latitudeOut;
    }

    public void setLatitudeOut(Double latitudeOut) {
        this.latitudeOut = latitudeOut;
    }
}