package com.concesionaria.backend.reservation.service;

import com.concesionaria.backend.reservation.dto.CreateReservationRequest;
import com.concesionaria.backend.reservation.dto.ReservationResponse;
import com.concesionaria.backend.reservation.dto.UpdateReservationDateRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public interface ReservationService {
    List<ReservationResponse> listReservations();
    ReservationResponse createReservation(CreateReservationRequest request, HttpSession session);
    ReservationResponse getReservation(Long id);
    ReservationResponse cancelReservation(Long id);
    ReservationResponse updateReservationDate(Long id, UpdateReservationDateRequest request);
}
