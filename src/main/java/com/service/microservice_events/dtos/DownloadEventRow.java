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
