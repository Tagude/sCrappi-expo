package com.talentotech.scrappi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.talentotech.scrappi.exception.ResourceNotFoundException;
import com.talentotech.scrappi.model.Alert;
import com.talentotech.scrappi.model.User;
import com.talentotech.scrappi.repository.AlertRepository;
import com.talentotech.scrappi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public Alert create(Alert alert) {
        Long userId = alert.getUser().getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        alert.setUser(user);

        if (alert.getRead() == null) {
            alert.setRead(false);
        }

        return alertRepository.save(alert);
    }

    public List<Alert> findAll() {
        return alertRepository.findAll();
    }

    public Alert findById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
    }

    public List<Alert> findByUser(Long userId) {
        return alertRepository.findByUserId(userId);
    }

    public Alert markAsRead(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        alert.setRead(true);
        return alertRepository.save(alert);
    }
}