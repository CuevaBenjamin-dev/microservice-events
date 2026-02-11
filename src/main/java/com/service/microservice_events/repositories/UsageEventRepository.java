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
