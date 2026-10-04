package com.concesionaria.backend.sale;

import java.math.BigDecimal;
import java.time.Instant;

public record SaleResponse(Long id, Long reservationId, String vin, String makeModel, Long clientId,
                           Long sellerId, Instant completedAt, BigDecimal finalAmount,
                           String clientName, String sellerName) {
    public static SaleResponse from(Sale sale) {
        return from(sale, null, null);
    }

    public static SaleResponse from(Sale sale, String clientName, String sellerName) {
        var reservation = sale.getReservation();
        return new SaleResponse(sale.getId(), reservation.getId(), reservation.getVehicle().getVin(),
                reservation.getVehicle().getMakeModel(), reservation.getClientId(), sale.getSellerId(),
                sale.getCompletedAt(), sale.getFinalAmount(), clientName, sellerName);
    }
}
