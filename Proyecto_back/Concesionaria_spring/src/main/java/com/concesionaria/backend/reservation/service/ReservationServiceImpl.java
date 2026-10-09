package com.concesionaria.backend.reservation.service;

import com.concesionaria.backend.client.repository.ClientRepository;
import com.concesionaria.backend.reservation.dto.CreateReservationRequest;
import com.concesionaria.backend.reservation.dto.ReservationResponse;
import com.concesionaria.backend.reservation.dto.UpdateReservationDateRequest;
import com.concesionaria.backend.reservation.entity.Reservation;
import com.concesionaria.backend.reservation.repository.ReservationRepository;
import com.concesionaria.backend.vehicle.entity.Vehicle;
import com.concesionaria.backend.vehicle.repository.VehicleRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservations;
    private final VehicleRepository vehicles;
    private final ClientRepository clients;

    public ReservationServiceImpl(ReservationRepository reservations, VehicleRepository vehicles, ClientRepository clients) {
        this.reservations = reservations;
        this.vehicles = vehicles;
        this.clients = clients;
    }

    @Override
    public List<ReservationResponse> listReservations() {
        return reservations.findAll().stream().map(ReservationResponse::from).toList();
    }

    @Override
    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request, HttpSession session) {
        Object userIdValue = session.getAttribute("userId");
        if (!(userIdValue instanceof Long userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in required");
        }
        if (!clients.existsById(request.clientId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found");
        }
        Vehicle vehicle = vehicles.findByVinForUpdate(request.vin().trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
        try {
            vehicle.reserveOne();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        return ReservationResponse.from(reservations.save(
                new Reservation(vehicle, request.clientId(), userId, request.reservationDate(),
                        request.notifyCustomer(), request.notes())));
    }

    @Override
    public ReservationResponse getReservation(Long id) {
        return reservations.findById(id).map(ReservationResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
    }

    @Override
    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation reservation = reservations.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        try {
            reservation.cancel();
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        vehicles.save(reservation.getVehicle());
        return ReservationResponse.from(reservations.save(reservation));
    }

    @Override
    @Transactional
    public ReservationResponse updateReservationDate(Long id, UpdateReservationDateRequest request) {
        Reservation reservation = reservations.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));
        try {
            reservation.updateReservationDate(request.reservationDate());
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, exception.getMessage());
        }
        return ReservationResponse.from(reservations.save(reservation));
    }
}
