package com.talentotech.scrappi.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "worklog")
public class WorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({ "workLogs", "alerts", "assignments", "sessions" })
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "workstation_id", nullable = false)
    @JsonIgnoreProperties({ "workLogs", "assignments" })
    private WorkStation workStation;

    @Column(name = "hour_check_in", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    
    private LocalDateTime hourCheckIn;

    @Column(name = "hour_check_out")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime hourCheckOut;

    @Column(name = "longitude_in", nullable = false)
    private Double longitudeIn;

    @Column(name = "latitude_in", nullable = false)
    private Double latitudeIn;

    @Column(name = "longitude_out")
    private Double longitudeOut;

    @Column(name = "latitude_out")
    private Double latitudeOut;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean complete = false;

    public WorkLog() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public WorkStation getWorkStation() {
        return workStation;
    }

    public void setWorkStation(WorkStation workStation) {
        this.workStation = workStation;
    }

    public LocalDateTime getHourCheckIn() {
        return hourCheckIn;
    }

    public void setHourCheckIn(LocalDateTime hourCheckIn) {
        this.hourCheckIn = hourCheckIn;
    }

    public LocalDateTime getHourCheckOut() {
        return hourCheckOut;
    }

    public void setHourCheckOut(LocalDateTime hourCheckOut) {
        this.hourCheckOut = hourCheckOut;
    }

    public Double getLongitudeIn() {
        return longitudeIn;
    }

    public void setLongitudeIn(Double longitudeIn) {
        this.longitudeIn = longitudeIn;
    }

    public Double getLatitudeIn() {
        return latitudeIn;
    }

    public void setLatitudeIn(Double latitudeIn) {
        this.latitudeIn = latitudeIn;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Boolean getComplete() {
        return complete;
    }

    public void setComplete(Boolean complete) {
        this.complete = complete;
    }
}