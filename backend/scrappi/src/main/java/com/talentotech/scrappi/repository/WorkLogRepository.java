package com.talentotech.scrappi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.talentotech.scrappi.model.WorkLog;

public interface WorkLogRepository extends JpaRepository<WorkLog, Long> {

    List<WorkLog> findByUserId(Long userId);

    List<WorkLog> findByWorkStationId(Long workStationId);

    Optional<WorkLog> findFirstByUserIdAndCompleteOrderByCreatedAtDesc(Long userId, Boolean complete);

    @Query(value = "SELECT EXTRACT(DOW FROM created_at) as dia, " +
            "COUNT(*) * 100 / 1 as porcentaje " + // Aquí la lógica según horario
            "FROM worklog " +
            "WHERE user_id = :userId " +
            "AND created_at >= current_date - interval '7 days' " +
            "GROUP BY dia", nativeQuery = true)
    List<Object[]> getWeeklyCompliance(@Param("userId") Long userId);
}