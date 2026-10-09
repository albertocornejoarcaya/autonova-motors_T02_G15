package com.concesionaria.backend.reservation.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateReservationDateRequest(@NotNull LocalDate reservationDate) {
}