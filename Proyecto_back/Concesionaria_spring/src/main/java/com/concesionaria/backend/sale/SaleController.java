package com.concesionaria.backend.sale;

import com.concesionaria.backend.common.NameLookup;
import com.concesionaria.backend.reservation.Reservation;
import com.concesionaria.backend.reservation.ReservationRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleRepository sales;
    private final ReservationRepository reservations;
    private final NameLookup names;

    public SaleController(SaleRepository sales, ReservationRepository reservations, NameLookup names) {
        this.sales = sales;
        this.reservations = reservations;
        this.names = names;
    }

    @GetMapping
    public List<SaleResponse> list() {
        Map<Long, String> clientNames = names.clientNames();
        Map<Long, String> userNames = names.userNames();
        return sales.findAll().stream()
                .sorted(Comparator.comparing(Sale::getCompletedAt).reversed())
                .map(sale -> SaleResponse.from(sale, clientNames.get(sale.getReservation().getClientId()),
                        userNames.get(sale.getSellerId())))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public SaleResponse complete(@Valid @RequestBody CreateSaleRequest request, HttpSession session) {
        Object userIdValue = session.getAttribute("userId");
        if (!(userIdValue instanceof Long sellerId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }

        Reservation reservation = reservations.findByIdForUpdate(request.reservationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        try {
            reservation.markCompleted();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }

        reservations.save(reservation);
        Sale sale = sales.save(new Sale(reservation, sellerId, request.finalAmount()));
        return SaleResponse.from(sale, names.clientName(reservation.getClientId()), names.userName(sellerId));
    }
}
