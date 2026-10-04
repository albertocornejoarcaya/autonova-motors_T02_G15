package com.concesionaria.backend.reservation;

import com.concesionaria.backend.client.ClientRepository;
import com.concesionaria.backend.common.NameLookup;
import com.concesionaria.backend.vehicle.Vehicle;
import com.concesionaria.backend.vehicle.VehicleRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final ReservationRepository reservations;
    private final VehicleRepository vehicles;
    private final ClientRepository clients;
    private final NameLookup names;

    public ReservationController(ReservationRepository reservations, VehicleRepository vehicles,
                                 ClientRepository clients, NameLookup names) {
        this.reservations = reservations;
        this.vehicles = vehicles;
        this.clients = clients;
        this.names = names;
    }

    @GetMapping
    public List<ReservationResponse> list() {
        Map<Long, String> clientNames = names.clientNames();
        Map<Long, String> userNames = names.userNames();
        return reservations.findAll().stream()
                .sorted(Comparator.comparing(Reservation::getReservedAt).reversed())
                .map(reservation -> ReservationResponse.from(reservation,
                        clientNames.get(reservation.getClientId()), userNames.get(reservation.getUserId())))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ReservationResponse create(@Valid @RequestBody CreateReservationRequest request, HttpSession session) {
        Object userIdValue = session.getAttribute("userId");
        if (!(userIdValue instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }
        if (!clients.existsById(request.clientId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        // Bloqueo pesimista: evita que dos asesores reserven la misma unidad a la vez.
        Vehicle vehicle = vehicles.findByVinForUpdate(request.vin().trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehículo no encontrado"));
        try {
            vehicle.reserveOne();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        Reservation saved = reservations.save(new Reservation(vehicle, request.clientId(), userId,
                request.reservationDate(), request.notifyCustomer(), request.notes()));
        return toResponse(saved);
    }

    @GetMapping("/{id}")
    public ReservationResponse get(@PathVariable Long id) {
        return reservations.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public ReservationResponse cancel(@PathVariable Long id) {
        Reservation reservation = reservations.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        try {
            reservation.cancel();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        vehicles.save(reservation.getVehicle());
        return toResponse(reservations.save(reservation));
    }

    @PutMapping("/{id}/date")
    @Transactional
    public ReservationResponse updateDate(@PathVariable Long id,
                                          @Valid @RequestBody UpdateReservationDateRequest request) {
        Reservation reservation = reservations.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        try {
            reservation.updateReservationDate(request.reservationDate());
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        return toResponse(reservations.save(reservation));
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return ReservationResponse.from(reservation, names.clientName(reservation.getClientId()),
                names.userName(reservation.getUserId()));
    }
}
