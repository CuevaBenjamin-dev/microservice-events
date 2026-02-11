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
