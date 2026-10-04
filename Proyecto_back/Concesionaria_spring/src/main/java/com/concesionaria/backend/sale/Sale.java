package com.concesionaria.backend.sale;

import com.concesionaria.backend.reservation.Reservation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;
    @Column(nullable = false)
    private Long sellerId;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;
    @Column(nullable = false)
    private Instant completedAt;

    protected Sale() { }

    public Sale(Reservation reservation, Long sellerId, BigDecimal finalAmount) {
        this.reservation = reservation;
        this.sellerId = sellerId;
        this.finalAmount = finalAmount;
        this.completedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Reservation getReservation() { return reservation; }
    public Long getSellerId() { return sellerId; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public Instant getCompletedAt() { return completedAt; }
}