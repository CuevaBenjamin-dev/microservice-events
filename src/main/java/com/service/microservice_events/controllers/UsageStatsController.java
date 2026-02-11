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
