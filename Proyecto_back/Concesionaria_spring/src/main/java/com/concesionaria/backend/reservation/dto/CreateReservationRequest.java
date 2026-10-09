package com.concesionaria.backend.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record CreateReservationRequest(@NotBlank String vin, @NotNull @Positive Long clientId,
                                       @NotNull LocalDate reservationDate, boolean notifyCustomer, String notes) {
}
