package com.talentotech.scrappi.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.everyItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

/**
 * Recorre la API real (controladores, servicios, JPA y seguridad) sobre una base H2 en memoria:
 * alta de usuario, inicio de sesión, edición y una jornada completa de entrada y salida.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ApiIntegrationTest {

    @Autowired
    private MockMvc mvc;

    private long crearUsuario(String userName, long documento, String clave) throws Exception {
        String json = """
                {"document": %d, "userName": "%s", "name": "Ana", "lastName": "Gómez",
                 "email": "%s@scrappi.co", "phone": 3001234567, "role": "EMPLOYED",
                 "password": "%s", "status": true}
                """.formatted(documento, userName, userName, clave);
        String respuesta = mvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    private long crearEstacion() throws Exception {
        String json = """
                {"name": "Puerta del Norte", "latitude": 6.351, "longitude": -75.556,
                 "radio_meter": 100, "description": "CC Puerta del Norte", "status": true}
                """;
        String respuesta = mvc.perform(post("/api/workstation").contentType(MediaType.APPLICATION_JSON).content(json))
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    private String login(String identificador, String clave) {
        return """
                {"identifier": "%s", "password": "%s"}
                """.formatted(identificador, clave);
    }

    @Test
    @DisplayName("La API nunca devuelve la contraseña, ni al crear ni al listar")
    void noExponeLaContrasena() throws Exception {
        crearUsuario("ana", 1001L, "secreta123");

        mvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.not(containsString("password"))));
    }

    @Test
    @DisplayName("Login correcto por usuario y por documento; clave incorrecta da 401")
    void iniciarSesion() throws Exception {
        crearUsuario("ana", 1001L, "secreta123");

        mvc.perform(post("/api/users/login").contentType(MediaType.APPLICATION_JSON).content(login("ana", "secreta123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("EMPLOYED"));
        mvc.perform(post("/api/users/login").contentType(MediaType.APPLICATION_JSON).content(login("1001", "secreta123")))
                .andExpect(status().isOk());
        mvc.perform(post("/api/users/login").contentType(MediaType.APPLICATION_JSON).content(login("ana", "mala")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Después de editar un usuario sin tocar su contraseña, puede seguir entrando")
    void editarNoRompeElLogin() throws Exception {
        long id = crearUsuario("ana", 1001L, "secreta123");

        mvc.perform(put("/api/users/" + id).contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"name": "Ana María", "status": true}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ana María"));

        mvc.perform(post("/api/users/login").contentType(MediaType.APPLICATION_JSON).content(login("ana", "secreta123")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Jornada completa: entrada, entrada duplicada (409), salida y salida duplicada (409)")
    void jornadaCompleta() throws Exception {
        long userId = crearUsuario("ana", 1001L, "secreta123");
        long estacionId = crearEstacion();
        String entrada = """
                {"user": {"id": %d}, "workStation": {"id": %d}, "latitudeIn": 6.3511, "longitudeIn": -75.5561}
                """.formatted(userId, estacionId);

        String respuesta = mvc.perform(post("/api/worklogs").contentType(MediaType.APPLICATION_JSON).content(entrada))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.complete").value(false))
                // la hora viaja con el desfase de Colombia, no como UTC
                .andExpect(jsonPath("$.hourCheckIn", endsWith("-05:00")))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        long worklogId = ((Number) JsonPath.read(respuesta, "$.id")).longValue();

        mvc.perform(post("/api/worklogs").contentType(MediaType.APPLICATION_JSON).content(entrada))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("jornada activa")));

        String salida = """
                {"latitudeOut": 6.3512, "longitudeOut": -75.5562}
                """;
        mvc.perform(put("/api/worklogs/" + worklogId + "/checkout").contentType(MediaType.APPLICATION_JSON).content(salida))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.complete").value(true))
                .andExpect(jsonPath("$.hourCheckOut", endsWith("-05:00")));

        mvc.perform(put("/api/worklogs/" + worklogId + "/checkout").contentType(MediaType.APPLICATION_JSON).content(salida))
                .andExpect(status().isConflict());

        mvc.perform(get("/api/worklogs/user/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].complete", everyItem(org.hamcrest.Matchers.is(true))));
    }
}
