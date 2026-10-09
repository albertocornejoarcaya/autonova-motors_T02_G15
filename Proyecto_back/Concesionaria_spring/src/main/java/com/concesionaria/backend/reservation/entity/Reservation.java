package com.concesionaria.backend.reservation.entity;

import com.concesionaria.backend.vehicle.entity.Vehicle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_vin", nullable = false)
    private Vehicle vehicle;
    @Column(nullable = false) private Long clientId;
    private Long userId;
    private LocalDate reservationDate;
    private boolean notifyCustomer;
    @Column(nullable = false) private Instant reservedAt;
    @Column(nullable = false) private String status;
    @Column(length = 1000) private String notes;

    protected Reservation() { }

    public Reservation(Vehicle vehicle, Long clientId, Long userId, LocalDate reservationDate,
                       boolean notifyCustomer, String notes) {
        this.vehicle = vehicle;
        this.clientId = clientId;
        this.userId = userId;
        this.reservationDate = reservationDate;
        this.notifyCustomer = notifyCustomer;
        this.notes = notes;
        this.reservedAt = Instant.now();
        this.status = "Pendiente";
    }

    public Long getId() { return id; }
    public Vehicle getVehicle() { return vehicle; }
    public Long getClientId() { return clientId; }
    public Long getUserId() { return userId; }
    public LocalDate getReservationDate() { return reservationDate; }
    public void updateReservationDate(LocalDate reservationDate) {
        ensurePending();
        this.reservationDate = reservationDate;
    }
    public void markCompleted() {
        ensurePending();
        status = "Concretada";
    }
    public void cancel() {
        ensurePending();
        vehicle.releaseReservation();
        status = "Cancelada";
    }
    private void ensurePending() {
        if (!"Pendiente".equalsIgnoreCase(status)) {
            throw new IllegalStateException("Only pending reservations can be changed");
        }
    }
    public boolean isNotifyCustomer() { return notifyCustomer; }
    public Instant getReservedAt() { return reservedAt; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
}
