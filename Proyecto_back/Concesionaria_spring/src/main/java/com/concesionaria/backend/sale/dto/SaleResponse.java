package com.concesionaria.backend.sale.dto;

import com.concesionaria.backend.sale.entity.Sale;
import java.math.BigDecimal;
import java.time.Instant;

public record SaleResponse(Long id, Long reservationId, String vin, String makeModel, Long clientId,
                           Long sellerId, Instant completedAt, BigDecimal finalAmount) {
    public static SaleResponse from(Sale sale) {
        var reservation = sale.getReservation();
        return new SaleResponse(sale.getId(), reservation.getId(), reservation.getVehicle().getVin(),
                reservation.getVehicle().getMakeModel(), reservation.getClientId(), sale.getSellerId(),
                sale.getCompletedAt(), sale.getFinalAmount());
    }
}