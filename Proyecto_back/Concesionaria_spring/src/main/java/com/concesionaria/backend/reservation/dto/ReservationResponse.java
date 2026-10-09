package com.concesionaria.backend.reservation.dto;

import com.concesionaria.backend.reservation.entity.Reservation;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ReservationResponse(Long id, String vin, String makeModel, Long clientId,
                                  Long userId, LocalDate reservationDate, boolean notifyCustomer,
                                  Instant reservedAt, String status, String notes, BigDecimal vehiclePrice) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(reservation.getId(), reservation.getVehicle().getVin(),
                reservation.getVehicle().getMakeModel(), reservation.getClientId(), reservation.getUserId(),
                reservation.getReservationDate(), reservation.isNotifyCustomer(), reservation.getReservedAt(),
                reservation.getStatus(), reservation.getNotes(), reservation.getVehicle().getPrice());
    }
}
