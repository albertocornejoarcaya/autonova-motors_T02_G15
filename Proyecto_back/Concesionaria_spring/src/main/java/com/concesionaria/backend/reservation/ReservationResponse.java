package com.concesionaria.backend.reservation;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ReservationResponse(Long id, String vin, String makeModel, Long clientId,
                                  Long userId, LocalDate reservationDate, boolean notifyCustomer,
                                  Instant reservedAt, String status, String notes, BigDecimal vehiclePrice,
                                  String clientName, String userName) {
    public static ReservationResponse from(Reservation reservation) {
        return from(reservation, null, null);
    }

    public static ReservationResponse from(Reservation reservation, String clientName, String userName) {
        return new ReservationResponse(reservation.getId(), reservation.getVehicle().getVin(),
                reservation.getVehicle().getMakeModel(), reservation.getClientId(), reservation.getUserId(),
                reservation.getReservationDate(), reservation.isNotifyCustomer(), reservation.getReservedAt(),
                reservation.getStatus(), reservation.getNotes(), reservation.getVehicle().getPrice(),
                clientName, userName);
    }
}
