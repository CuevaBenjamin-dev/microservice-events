SecurityConfig.java (back) :


package com.service.microservice_events.config;

import org.springframework.context.annotation.Configuration;
import com.service.microservice_events.security.JwtAuthFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;

@Configuration
public class SecurityConfig {

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> jwtFilter(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> reg = new FilterRegistrationBean<>();
        reg.setFilter(filter);
        reg.addUrlPatterns("/*");
        reg.setOrder(1);
        return reg;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageAdminController.java (back) :


package com.service.microservice_events.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.service.microservice_events.dtos.ApiResponse;
import com.service.microservice_events.dtos.DownloadEventRow;
import com.service.microservice_events.services.UsageEventService;

@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
@RestController
@RequestMapping("/api/events/admin")
public class UsageAdminController {

    private final UsageEventService service;

    public UsageAdminController(UsageEventService service) {
        this.service = service;
    }

    @GetMapping("/downloads")
    public ApiResponse<List<DownloadEventRow>> downloads(
            @RequestParam String usuario,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LocalDate fromDate = (from == null || from.isBlank()) ? null : LocalDate.parse(from);
        LocalDate toDate = (to == null || to.isBlank()) ? null : LocalDate.parse(to);

        return ApiResponse.ok(
                "Descargas",
                service.getDownloads(usuario, fromDate, toDate));
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageEventController.java (back) :


package com.service.microservice_events.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.service.microservice_events.dtos.ApiResponse;
import com.service.microservice_events.dtos.UsageEventRequest;
import com.service.microservice_events.security.JwtService;
import com.service.microservice_events.services.UsageEventService;

/**
 * CONTROLLER DE EVENTOS
 *
 * NIVEL 9:
 * - Protegido por JWT
 * - NO depende del frontend
 */
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
@RestController
@RequestMapping("/api/events")
public class UsageEventController {

    private final UsageEventService service;
    private final JwtService jwtService;

    public UsageEventController(
            UsageEventService service,
            JwtService jwtService) {
        this.service = service;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ApiResponse<?> register(@Valid @RequestBody UsageEventRequest req, HttpServletRequest http) {

        String auth = http.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ApiResponse.error("Authorization inválido", null);
        }

        String token = auth.substring(7);
        String usuario = jwtService.getUsername(token);

        service.register(usuario, req.getEvento(), req.getItems(), req.getOrigen());

        return ApiResponse.ok("Evento registrado", null);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageStatsController.java (back) :


package com.service.microservice_events.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.service.microservice_events.dtos.ApiResponse;
import com.service.microservice_events.dtos.UsageStatsResponse;
import com.service.microservice_events.services.UsageEventService;

/**
 * CONTROLLER DE ESTADÍSTICAS
 *
 * NIVEL 9.1:
 * - Solo lectura
 * - Protegido por JWT (filtro global)
 */
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*")
@RestController
@RequestMapping("/api/events/stats")
public class UsageStatsController {

    private final UsageEventService service;

    public UsageStatsController(UsageEventService service) {
        this.service = service;
    }

    /**
     * Estadísticas del día actual.
     */
    @GetMapping("/today")
    public ApiResponse<UsageStatsResponse> today() {
        return ApiResponse.ok(
                "Estadísticas del día",
                service.getStatsToday());
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiResponse.java (back) :


package com.service.microservice_events.dtos;

/**
 * Respuesta estándar del API.
 * 
 * NIVEL 2 - PASO 3:
 * - Unifica TODAS las respuestas del backend
 * - Facilita escalabilidad y reutilización
 */
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private Object errors;

    public ApiResponse(boolean success, String message, T data, Object errors) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public Object getErrors() { return errors; }

    // Helpers estáticos (muy útiles)
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static ApiResponse<?> error(String message, Object errors) {
        return new ApiResponse<>(false, message, null, errors);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageEventRequest.java (back) :


package com.service.microservice_events.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class UsageEventRequest {

    @NotBlank
    private String evento;

    @Min(1)
    private int items;

    private String origen = "WEB";

    public String getEvento() { return evento; }
    public int getItems() { return items; }
    public String getOrigen() { return origen; }

    // ✅ AGREGAR SETTERS (CLAVE)
    public void setEvento(String evento) { this.evento = evento; }
    public void setItems(int items) { this.items = items; }
    public void setOrigen(String origen) { this.origen = origen; }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageStatsResponse.java (back) :


package com.service.microservice_events.dtos;

/**
 * DTO DE RESPUESTA DE ESTADÍSTICAS
 *
 * NIVEL 9.1:
 * - Solo lectura
 * - Diseñado para dashboards
 */
public class UsageStatsResponse {

    private long eventosHoy;
    private long itemsHoy;

    public UsageStatsResponse(long eventosHoy, long itemsHoy) {
        this.eventosHoy = eventosHoy;
        this.itemsHoy = itemsHoy;
    }

    public long getEventosHoy() {
        return eventosHoy;
    }

    public long getItemsHoy() {
        return itemsHoy;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageEvent.java (back) :


package com.service.microservice_events.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * ENTIDAD USAGE EVENT
 *
 * NIVEL 9:
 * - Representa un evento de uso del sistema
 * - Cada fila = 1 acción relevante de negocio
 */
@Data
@Entity
@Table(name = "usage_events")
public class UsageEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario autenticado (extraído del JWT)
    @Column(nullable = false)
    private String usuario;

    // Tipo de evento (PPTX_GENERATED, LOGIN, etc.)
    @Column(nullable = false)
    private String evento;

    // Cantidad de items involucrados
    @Column(name = "items_count", nullable = false)
    private int itemsCount;

    // Origen del evento (WEB, API, CRON, etc.)
    @Column(nullable = false)
    private String origen = "WEB";

    // Fecha del evento
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageEventRepository.java (back) :


package com.service.microservice_events.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.service.microservice_events.models.UsageEvent;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.List;

public interface UsageEventRepository extends JpaRepository<UsageEvent, Long> {

    List<UsageEvent> findByUsuarioAndEventoAndCreatedAtBetween(
            String usuario,
            String evento,
            LocalDateTime start,
            LocalDateTime end);

    List<UsageEvent> findByUsuarioAndEvento(String usuario, String evento, Sort sort);

    List<UsageEvent> findByUsuario(String usuario);

    long countByEventoAndCreatedAtBetween(
            String evento,
            LocalDateTime start,
            LocalDateTime end);

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end);

    @Query("""
                SELECT COUNT(e)
                FROM UsageEvent e
                WHERE e.createdAt BETWEEN :start AND :end
            """)
    long countEventosHoy(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
                SELECT COALESCE(SUM(e.itemsCount), 0)
                FROM UsageEvent e
                WHERE e.createdAt BETWEEN :start AND :end
            """)
    long sumItemsHoy(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JwtAuthFilter.java (back) :


package com.service.microservice_events.security;

import org.springframework.stereotype.Component;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // ✅ CORS headers SIEMPRE (especialmente para 401)
        String origin = req.getHeader("Origin");
        if (origin != null && origin.equals("http://localhost:4200")) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Vary", "Origin");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        }

        String path = req.getRequestURI();

        // ✅ Preflight
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = auth.substring(7);

        if (!jwtService.isTokenValid(token) || !jwtService.isAccessToken(token)) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // ✅ Autorización por rol SOLO para endpoints admin de eventos
        if (path.startsWith("/api/events/admin")) {
            String role = jwtService.getRole(token);
            if (!"ADMIN".equals(role)) {
                res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        chain.doFilter(request, response);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

DownloadEventRow (back) : 


package com.service.microservice_events.dtos;

import java.time.LocalDateTime;

public class DownloadEventRow {
    private String usuario;
    private LocalDateTime createdAt;

    public DownloadEventRow(String usuario, LocalDateTime createdAt) {
        this.usuario = usuario;
        this.createdAt = createdAt;
    }

    public String getUsuario() {
        return usuario;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JwtService.java (back) :


package com.service.microservice_events.security;

import java.util.Date;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

/**
 * Servicio encargado de generar y gestionar JWT.
 * 
 * NIVEL 4:
 * - Access Token (vida corta)
 * - Refresh Token (vida larga)
 */
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /**
     * Genera un ACCESS TOKEN.
     * 
     * - Se usa para acceder a endpoints protegidos
     * - Vida corta
     */
    public String generateAccessToken(String username) {
        return generateToken(username, accessExpirationMs, "ACCESS");
    }

    /**
     * Genera un REFRESH TOKEN.
     * 
     * - Se usa solo para renovar el access token
     * - Vida larga
     */
    public String generateRefreshToken(String username) {
        return generateToken(username, refreshExpirationMs, "REFRESH");
    }

    /**
     * Método interno para generar tokens JWT.
     */

    private String generateToken(String username, long expirationMs, String type) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setId(UUID.randomUUID().toString()) // 🔥 CLAVE
                .setSubject(username)
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Métodos de validación JWT.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extrae los claims del token.
     */
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valida que el token sea de tipo ACCESS.
     */
    public boolean isAccessToken(String token) {
        Claims claims = getClaims(token);
        return "ACCESS".equals(claims.get("type"));
    }

    /**
     * Extrae el username (subject).
     */
    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        Claims claims = getClaims(token);
        return "REFRESH".equals(claims.get("type"));
    }

    // JwtService.java (microservice-events)

    public String getRole(String token) {
        Claims claims = getClaims(token);
        Object role = claims.get("role");
        return role == null ? null : role.toString();
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

UsageEventService.java (back) :


package com.service.microservice_events.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import com.service.microservice_events.dtos.DownloadEventRow;
import com.service.microservice_events.dtos.UsageStatsResponse;
import com.service.microservice_events.models.UsageEvent;
import com.service.microservice_events.repositories.UsageEventRepository;

/**
 * SERVICIO DE EVENTOS
 *
 * NIVEL 9:
 * - Contiene la lógica de negocio
 * - El controller NO sabe cómo se guarda
 */
@Service
public class UsageEventService {

    private final UsageEventRepository repository;

    public UsageEventService(UsageEventRepository repository) {
        this.repository = repository;
    }

    /**
     * Registra un evento de uso.
     */
    public void register(
            String usuario,
            String evento,
            int items,
            String origen) {
        UsageEvent e = new UsageEvent();
        e.setUsuario(usuario);
        e.setEvento(evento);
        e.setItemsCount(items);
        e.setOrigen(origen);

        repository.save(e);
    }

    public UsageStatsResponse getStatsToday() {

        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);

        long eventos = repository.countEventosHoy(start, end);
        long items = repository.sumItemsHoy(start, end);

        return new UsageStatsResponse(eventos, items);
    }

    public List<DownloadEventRow> getDownloads(String usuario, LocalDate from, LocalDate to) {
        final String EVENTO = "PPTX_DOWNLOADED";

        // Si no mandan rango -> devolver todo ordenado desc
        if (from == null || to == null) {
            return repository
                    .findByUsuarioAndEvento(usuario, EVENTO, Sort.by(Sort.Direction.DESC, "createdAt"))
                    .stream()
                    .map(e -> new DownloadEventRow(e.getUsuario(), e.getCreatedAt()))
                    .collect(Collectors.toList());
        }

        // rango inclusive: from 00:00:00 hasta to 23:59:59
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.atTime(LocalTime.of(23, 59, 59));

        return repository
                .findByUsuarioAndEventoAndCreatedAtBetween(usuario, EVENTO, start, end)
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(e -> new DownloadEventRow(e.getUsuario(), e.getCreatedAt()))
                .collect(Collectors.toList());
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

application.properties (back) :


spring.application.name=microservice-events

# ===============================
# CONFIGURACIÓN DEL SERVIDOR
# ===============================
server.port=8082

# ===============================
# DATASOURCE - MYSQL
# ===============================
spring.datasource.url=jdbc:mysql://localhost:3306/ipde
spring.datasource.username=root
spring.datasource.password=wa1000201002
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ===============================
# JPA / HIBERNATE
# ===============================
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Dialecto recomendado para MySQL
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect

# Deshabilitar Open Session in View para evitar problemas de LazyInitializationException
spring.jpa.open-in-view=false

# ===============================
# JWT CONFIGURATION
# ===============================

# Clave para firmar tokens
jwt.secret=mi_clave_secreta_super_segura_2026

# Access token: 15 minutos
jwt.access-expiration-ms=900000

# Refresh token: 7 días
jwt.refresh-expiration-ms=604800000

