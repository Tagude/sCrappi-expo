package com.talentotech.scrappi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talentotech.scrappi.model.Alert;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserId(Long userId);
    List<Alert> findByUserIdAndRead(Long userId, Boolean read);
}