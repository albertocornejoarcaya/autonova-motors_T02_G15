package com.concesionaria.backend.reservation;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record UpdateReservationDateRequest(@NotNull LocalDate reservationDate) {
}