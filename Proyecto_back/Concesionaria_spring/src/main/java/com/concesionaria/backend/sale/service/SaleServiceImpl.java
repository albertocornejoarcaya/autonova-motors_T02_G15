package com.concesionaria.backend.sale.service;

import com.concesionaria.backend.reservation.entity.Reservation;
import com.concesionaria.backend.reservation.repository.ReservationRepository;
import com.concesionaria.backend.sale.dto.CreateSaleRequest;
import com.concesionaria.backend.sale.dto.SaleResponse;
import com.concesionaria.backend.sale.entity.Sale;
import com.concesionaria.backend.sale.repository.SaleRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SaleServiceImpl implements SaleService {
    private final SaleRepository sales;
    private final ReservationRepository reservations;

    public SaleServiceImpl(SaleRepository sales, ReservationRepository reservations) {
        this.sales = sales;
        this.reservations = reservations;
    }

    @Override
    public List<SaleResponse> listSales() {
        return sales.findAll().stream().map(SaleResponse::from).toList();
    }

    @Override
    @Transactional
    public SaleResponse completeSale(CreateSaleRequest request, HttpSession session) {
        Object userIdValue = session.getAttribute("userId");
        if (!(userIdValue instanceof Long sellerId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
        }

        Reservation reservation = reservations.findByIdForUpdate(request.reservationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        try {
            reservation.markCompleted();
            reservation.getVehicle().markSold();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }

        reservations.save(reservation);
        return SaleResponse.from(sales.save(new Sale(reservation, sellerId, request.finalAmount())));
    }
}
