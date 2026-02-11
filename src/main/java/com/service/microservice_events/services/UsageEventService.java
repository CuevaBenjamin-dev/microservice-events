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
