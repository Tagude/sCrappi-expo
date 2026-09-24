package com.talentotech.scrappi.service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.talentotech.scrappi.exception.ResourceNotFoundException;
import com.talentotech.scrappi.model.Session;
import com.talentotech.scrappi.model.SessionStatus;
import com.talentotech.scrappi.model.User;
import com.talentotech.scrappi.repository.SessionRepository;
import com.talentotech.scrappi.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;


    public Session createLoginSession(Long userId, String ip, String device) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Session session = new Session();
        session.setUser(user);
        session.setStatus(SessionStatus.ACTIVE);
        session.setIp(ip);
        session.setDevice(device);

        return sessionRepository.save(session);
    }        

    public Session logoutSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setStatus(SessionStatus.LOGOUT);
        session.setLogoutAt(LocalDateTime.now());

        return sessionRepository.save(session);
    }

    public List<Session> findAll() {
        return sessionRepository.findAll();
    }

    public Session findById(Long id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));
    }

    public List<Session> findByUser(Long userId) {
        return sessionRepository.findByUserId(userId);
    }


}
