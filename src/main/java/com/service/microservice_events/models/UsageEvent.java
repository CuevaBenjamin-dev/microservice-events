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
