package com.concesionaria.backend.sale;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateSaleRequest(@NotNull @Positive Long reservationId,
                                @NotNull @DecimalMin("0.01") BigDecimal finalAmount) {
}