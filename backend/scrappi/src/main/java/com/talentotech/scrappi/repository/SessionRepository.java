package com.talentotech.scrappi.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talentotech.scrappi.model.Session;
import com.talentotech.scrappi.model.SessionStatus;

public interface SessionRepository extends JpaRepository<Session, Long> {
        // Buscar alertas por usuario
        List<Session> findByUserId(Long userId);

        List<Session> findByUserIdAndStatus(Long userId, SessionStatus status);
    
        Optional<Session> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, SessionStatus status);

}
