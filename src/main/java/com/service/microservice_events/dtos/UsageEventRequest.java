package com.service.microservice_events.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO DE REGISTRO DE EVENTO
 *
 * NIVEL 9:
 * - Entrada controlada
 * - Validación declarativa
 */
public class UsageEventRequest {

    @NotBlank
    private String evento;

    @Min(1)
    private int items;

    private String origen = "WEB";

    public String getEvento() {
        return evento;
    }

    public int getItems() {
        return items;
    }

    public String getOrigen() {
        return origen;
    }

    // ✅ AGREGAR SETTERS (CLAVE)
    public void setEvento(String evento) {
        this.evento = evento;
    }

    public void setItems(int items) {
        this.items = items;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }
}
