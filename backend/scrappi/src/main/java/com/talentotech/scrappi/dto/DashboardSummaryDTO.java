package com.talentotech.scrappi.dto;


import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryDTO {
    private String lastEvent;       // Ejemplo: "Entrada: 07:13 AM"
    private String locationStatus;  // Ejemplo: "Sabaneta - DENTRO"
    private int alertsToday;        // Conteo de incumplimientos
    private boolean isInside;       // Para cambiar el color de la tarjeta en Angular
    private List<Integer> weeklyProgress; // Ejemplo: [100, 90, 80, 100, 100, 0, 0]
}