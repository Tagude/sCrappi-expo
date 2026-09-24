package com.talentotech.scrappi.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.talentotech.scrappi.model.User;
import com.talentotech.scrappi.model.WorkLog;
import com.talentotech.scrappi.model.WorkStation;
import com.talentotech.scrappi.repository.UserRepository;
import com.talentotech.scrappi.repository.WorkLogRepository;
import com.talentotech.scrappi.repository.WorkStationRepository;

@ExtendWith(MockitoExtension.class)
class WorkLogServiceTest {

    @Mock
    private WorkLogRepository workLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WorkStationRepository workStationRepository;
    @InjectMocks
    private WorkLogService workLogService;

    private WorkLog entradaDe(long userId) {
        User u = new User();
        u.setId(userId);
        WorkStation w = new WorkStation();
        w.setId(1L);
        WorkLog log = new WorkLog();
        log.setUser(u);
        log.setWorkStation(w);
        log.setLatitudeIn(6.351);
        log.setLongitudeIn(-75.556);
        return log;
    }

    private WorkLog jornada(boolean completa) {
        WorkLog log = entradaDe(1L);
        log.setComplete(completa);
        return log;
    }

    @Test
    @DisplayName("Registra la entrada con la hora de Bogotá y la jornada abierta")
    void registraEntrada() {
        WorkLog entrada = entradaDe(1L);
        when(workLogRepository.findByUserId(1L)).thenReturn(List.of(jornada(true)));
        when(userRepository.findById(1L)).thenReturn(Optional.of(entrada.getUser()));
        when(workStationRepository.findById(1L)).thenReturn(Optional.of(entrada.getWorkStation()));
        when(workLogRepository.save(any(WorkLog.class))).thenAnswer(i -> i.getArgument(0));

        WorkLog guardado = workLogService.create(entrada);

        assertThat(guardado.getComplete()).isFalse();
        assertThat(guardado.getHourCheckIn())
                .isCloseTo(LocalDateTime.now(ZoneId.of("America/Bogota")), within(5, ChronoUnit.SECONDS));
    }

    @Test
    @DisplayName("No deja abrir una segunda jornada si hay una sin cerrar")
    void rechazaJornadaDuplicada() {
        when(workLogRepository.findByUserId(1L)).thenReturn(List.of(jornada(false)));

        assertThatThrownBy(() -> workLogService.create(entradaDe(1L)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("jornada activa");
        verify(workLogRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registra la salida: guarda la hora, la ubicación y cierra la jornada")
    void registraSalida() {
        WorkLog abierta = jornada(false);
        when(workLogRepository.findById(10L)).thenReturn(Optional.of(abierta));
        when(workLogRepository.save(any(WorkLog.class))).thenAnswer(i -> i.getArgument(0));

        WorkLog cerrada = workLogService.checkout(10L, -75.5561, 6.3511);

        assertThat(cerrada.getComplete()).isTrue();
        assertThat(cerrada.getHourCheckOut()).isNotNull();
        assertThat(cerrada.getLatitudeOut()).isEqualTo(6.3511);
        assertThat(cerrada.getLongitudeOut()).isEqualTo(-75.5561);
    }

    @Test
    @DisplayName("No deja registrar dos veces la salida de la misma jornada")
    void rechazaSalidaDuplicada() {
        when(workLogRepository.findById(10L)).thenReturn(Optional.of(jornada(true)));

        assertThatThrownBy(() -> workLogService.checkout(10L, -75.556, 6.351))
                .isInstanceOf(IllegalStateException.class);
        verify(workLogRepository, never()).save(any());
    }
}
