package com.talentotech.scrappi.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "workstation")
public class WorkStation {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false,unique=true)
    private String name;
    @Column(nullable=false, unique=true)
    private double longitude;
    @Column(nullable=false)
    private double latitude;
    @Column(nullable=false)
    private double radio_meter;
    @Column(nullable=false)
    private String description;
    @Column(nullable=false)
    private boolean status;
    @JsonIgnore
    @OneToMany(mappedBy = "workStation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkLog> workLogs;
    @JsonIgnore
    @OneToMany(mappedBy = "workStation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assignment> assignments;



    public WorkStation(){}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getRadio_meter() {
        return radio_meter;
    }

    public void setRadio_meter(double radio_meter) {
        this.radio_meter = radio_meter;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public List <WorkLog>getWorkLogs() {
        return workLogs;
    }

    public void setWorkLogs(List <WorkLog> workLogs) {
        this.workLogs = workLogs;
    }

    public List<Assignment> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<Assignment> assignments) {
        this.assignments = assignments;
    }

    

}
