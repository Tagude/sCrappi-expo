package com.talentotech.scrappi.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.talentotech.scrappi.model.WorkStation;

public interface WorkStationRepository extends JpaRepository<WorkStation, Long>{
    Optional<WorkStation> findByName(String name);

    boolean existsByName(String name);

}
