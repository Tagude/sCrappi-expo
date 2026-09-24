package com.talentotech.scrappi.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.talentotech.scrappi.dto.DashboardSummaryDTO;
import com.talentotech.scrappi.dto.WorkLogCheckoutRequest;
import com.talentotech.scrappi.model.WorkLog;
import com.talentotech.scrappi.repository.WorkLogRepository;
import com.talentotech.scrappi.service.WorkLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/worklogs")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor

public class WorkLogController {
    private final WorkLogService workLogService;
    private final WorkLogRepository workLogRepository;

    @GetMapping("/summary/{userId}")
    public ResponseEntity<DashboardSummaryDTO> getUserSummary(@PathVariable Long userId) {
        Optional<WorkLog> lastLog = workLogRepository.findFirstByUserIdAndCompleteOrderByCreatedAtDesc(userId, false)
                .or(() -> workLogRepository.findFirstByUserIdAndCompleteOrderByCreatedAtDesc(userId, true));

        String event = "Sin registros";
        String location = "Ubicación desconocida";
        boolean inside = false;

        if (lastLog.isPresent()) {
            WorkLog log = lastLog.get();

            // 1. Decidimos qué hora mostrar (Entrada o Salida) según el estado
            LocalDateTime horaAMostrar = log.getComplete() ? log.getHourCheckOut() : log.getHourCheckIn();

            // 2. Formateamos la hora con seguridad (null-safe)
            String time = (horaAMostrar != null)
                    ? horaAMostrar.format(DateTimeFormatter.ofPattern("hh:mm a"))
                    : "--:--";

            // 3. Construimos los Strings finales para el Dashboard
            event = (log.getComplete() ? "Salida: " : "Entrada: ") + time;
            location = log.getWorkStation().getName() + (log.getComplete() ? " - FUERA" : " - DENTRO");
            inside = !log.getComplete();
        }

        // 📊 LÓGICA REAL PARA EL GRÁFICO
        List<Object[]> complianceData = workLogRepository.getWeeklyCompliance(userId);
        // Inicializamos los 7 días en 0
        Integer[] progress = { 0, 0, 0, 0, 0, 0, 0 };
        for (Object[] row : complianceData) {
            int day = ((Number) row[0]).intValue(); // 0=Dom, 1=Lun... en Postgres
            int val = ((Number) row[1]).intValue();
            // Ajustamos el índice según tu frontend (que asume Lun-Dom)
            int index = (day == 0) ? 6 : day - 1;
            if (index >= 0 && index < 7)
                progress[index] = val;
        }

        DashboardSummaryDTO summary = DashboardSummaryDTO.builder()
                .lastEvent(event)
                .locationStatus(location)
                .alertsToday(0)
                .isInside(inside)
                .weeklyProgress(List.of(progress))
                .build();

        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<WorkLog> create(@RequestBody WorkLog workLog) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workLogService.create(workLog));
    }

    @PutMapping("/{id}/checkout")
    public ResponseEntity<WorkLog> checkout(@PathVariable Long id,
            @RequestBody WorkLogCheckoutRequest request) {
        // 👈 Aquí le pasamos al service los campos individuales que pide
        return ResponseEntity.ok(
                workLogService.checkout(id, request.getLongitudeOut(), request.getLatitudeOut()));
    }

    @GetMapping
    public ResponseEntity<List<WorkLog>> findAll() {
        return ResponseEntity.ok(workLogService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkLog> findById(@PathVariable Long id) {
        return ResponseEntity.ok(workLogService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkLog>> findByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(workLogService.findByUser(userId));
    }

    @GetMapping("/workstation/{workStationId}")
    public ResponseEntity<List<WorkLog>> findByWorkStation(@PathVariable Long workStationId) {
        return ResponseEntity.ok(workLogService.findByWorkStation(workStationId));
    }

}