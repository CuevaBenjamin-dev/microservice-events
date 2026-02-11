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
