package com.concesionaria.backend.reservation.repository;

import com.concesionaria.backend.reservation.entity.Reservation;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
	@Override
	@EntityGraph(attributePaths = "vehicle")
	List<Reservation> findAll();

	@Override
	@EntityGraph(attributePaths = "vehicle")
	Optional<Reservation> findById(Long id);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select reservation from Reservation reservation where reservation.id = :id")
	Optional<Reservation> findByIdForUpdate(@Param("id") Long id);
}
