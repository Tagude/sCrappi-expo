package com.talentotech.scrappi.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.talentotech.scrappi.dto.LoginRequest;
import com.talentotech.scrappi.model.Role;
import com.talentotech.scrappi.model.User;
import com.talentotech.scrappi.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private SessionService sessionService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, encoder, sessionService);
    }

    private User usuario(String claveEnClaro, boolean activo) {
        User u = new User();
        u.setId(1L);
        u.setDocument(1234567L);
        u.setUserName("tagude");
        u.setName("Tania");
        u.setRole(Role.ADMIN);
        u.setStatus(activo);
        u.setPassword(encoder.encode(claveEnClaro));
        return u;
    }

    private LoginRequest login(String identificador, String clave) {
        LoginRequest r = new LoginRequest();
        r.setIdentifier(identificador);
        r.setPassword(clave);
        return r;
    }

    @Test
    @DisplayName("Al crear un usuario la contraseña se guarda cifrada con BCrypt")
    void crearUsuarioCifraLaContrasena() {
        User nuevo = new User();
        nuevo.setPassword("secreta123");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User guardado = userService.crearUsuario(nuevo);

        assertThat(guardado.getPassword()).isNotEqualTo("secreta123");
        assertThat(encoder.matches("secreta123", guardado.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Editar un usuario sin escribir contraseña conserva la que tenía")
    void editarSinContrasenaNoLaCambia() {
        User existente = usuario("secreta123", true);
        String hashOriginal = existente.getPassword();
        when(userRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User cambios = new User();
        cambios.setName("Tania Marcela");
        cambios.setStatus(true);
        User actualizado = userService.update(1L, cambios);

        assertThat(actualizado.getName()).isEqualTo("Tania Marcela");
        assertThat(actualizado.getPassword()).isEqualTo(hashOriginal);
    }

    @Test
    @DisplayName("Editar un usuario con contraseña nueva la cifra")
    void editarConContrasenaNuevaLaCifra() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(usuario("vieja123", true)));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User cambios = new User();
        cambios.setPassword("nueva456");
        cambios.setStatus(true);
        User actualizado = userService.update(1L, cambios);

        assertThat(encoder.matches("nueva456", actualizado.getPassword())).isTrue();
    }

    @Test
    @DisplayName("Inicia sesión con el número de documento y registra la sesión")
    void loginPorDocumento() {
        when(userRepository.findByDocument(1234567L)).thenReturn(Optional.of(usuario("secreta123", true)));

        User u = userService.login(login("1234567", "secreta123"), new MockHttpServletRequest());

        assertThat(u.getUserName()).isEqualTo("tagude");
        verify(sessionService).createLoginSession(anyLong(), anyString(), any());
    }

    @Test
    @DisplayName("Inicia sesión con el nombre de usuario")
    void loginPorNombreDeUsuario() {
        when(userRepository.findByUserName("tagude")).thenReturn(Optional.of(usuario("secreta123", true)));

        User u = userService.login(login("tagude", "secreta123"), new MockHttpServletRequest());

        assertThat(u.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Rechaza una contraseña incorrecta con 401 y no abre sesión")
    void loginConContrasenaIncorrecta() {
        when(userRepository.findByUserName("tagude")).thenReturn(Optional.of(usuario("secreta123", true)));

        assertThatThrownBy(() -> userService.login(login("tagude", "otra"), new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(sessionService, never()).createLoginSession(anyLong(), anyString(), any());
    }

    @Test
    @DisplayName("Un usuario desactivado no puede iniciar sesión (403)")
    void loginDeUsuarioDesactivado() {
        when(userRepository.findByUserName("tagude")).thenReturn(Optional.of(usuario("secreta123", false)));

        assertThatThrownBy(() -> userService.login(login("tagude", "secreta123"), new MockHttpServletRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Desactivar un usuario es un borrado lógico: cambia su estado")
    void desactivarEsBorradoLogico() {
        User existente = usuario("secreta123", true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(existente));

        userService.delete(1L);

        assertThat(existente.isStatus()).isFalse();
        verify(userRepository).save(existente);
    }
}
