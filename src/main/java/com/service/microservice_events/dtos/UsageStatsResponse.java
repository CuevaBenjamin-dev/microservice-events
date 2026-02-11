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
