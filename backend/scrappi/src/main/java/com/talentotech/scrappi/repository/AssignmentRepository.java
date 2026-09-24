package com.talentotech.scrappi.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talentotech.scrappi.model.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByUserId(Long userId);

    List<Assignment> findByWorkStationId(Long workStationId);

    boolean existsByUserIdAndWorkStationIdAndStartDateAndEndDate(
            Long userId,
            Long workStationId,
            LocalDate startDate,
            LocalDate endDate
    );
}