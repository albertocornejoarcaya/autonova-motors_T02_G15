package com.concesionaria.backend.config;

import com.concesionaria.backend.client.entity.Client;
import com.concesionaria.backend.client.repository.ClientRepository;
import com.concesionaria.backend.reservation.entity.Reservation;
import com.concesionaria.backend.reservation.repository.ReservationRepository;
import com.concesionaria.backend.vehicle.entity.Vehicle;
import com.concesionaria.backend.vehicle.repository.VehicleRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataConfiguration {
    @Bean
    CommandLineRunner loadDemoVehicles(VehicleRepository vehicles, ClientRepository clients,
                                       ReservationRepository reservations) {
        return args -> {
            if (clients.count() == 0) {
                clients.save(new Client("Juan Carlos", "García López", "12345678", "+51 999 000 111",
                        "juan.garcia@example.com", "Lima"));
            }
            if (vehicles.count() == 0) {
                vehicles.saveAll(List.of(
                        new Vehicle("3TMAZ5CN8KM104928", "Toyota RAV4", 2026, "SUV", "SL-01", "Disponible", "Híbrido", "CVT Elect.", "2.5L 4 CTI", new BigDecimal("38900"), "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6ob8xeYEYUFp8yn41zuWG_dBc1gtibsDxooZWkRMCPwKdT0Rtrew41Ig&s=10", "2.5L Hybrid AWD · Blanco Perlado", "Patio Central - Sector A-04", 1),
                        new Vehicle("1HGCR2F81JA019482", "Honda Civic Touring", 2025, "Sedán", "SL-04", "Disponible", "Gasolina", "CVT Sport", "1.5L Turbo", new BigDecimal("32500"), "https://www.toyotacorolla.com.pe/assets/images/design-image-18-1.png", "1.5L Turbo CVT · Gris Meteorito", "Nave 2 - Bahía B-12", 3),
                        new Vehicle("1FTFW1E04MFA83912", "Ford Ranger XLT", 2025, "Pick-up", "PT-11", "Disponible", "Diésel", "Aut. 10-Vel", "2.0L Bi-Turbo", new BigDecimal("46200"), "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS42tCYlxV4AMVLc_XyDan7LoMcflATgKyFPAb_LqyK7m525T2QnSzJvNs&s=10", "3.0L V6 Turbo Diesel 4x4 · Azul Cobalto", "Patio Norte - Cajón C-08", 1),
                        new Vehicle("JM3KFBDM9RB654129", "Mazda CX-5 Signature", 2026, "SUV", "SL-08", "Mantenimiento", "Gasolina", "Aut. 6-Vel", "2.5L Turbo", new BigDecimal("36800"), "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd-p2bR_W0bs6dDe5htA5fgeV61zsK4SS49OJpk_-H7iFy8Nd3FabCwQmC&s=10", "2.5 Turbo AWD · Soul Red Crystal", "Taller Inspección - Rampa 3", 1),
                        new Vehicle("3VW287AJ9SH203841", "Volkswagen Jetta GLI", 2025, "Sedán", "SL-05", "Disponible", "Gasolina", "DSG 7-Vel", "2.0L TSI", new BigDecimal("31900"), "https://www.mitsubishi-motors.com.pe/blog/wp-content/uploads/2020/06/tecnologia-nuevo-carro.jpg", "2.0L TSI DSG 7 vel. · Pure Gray", "Patio Central - Sector A-09", 2),
                        new Vehicle("8AJHA8CD6R5819284", "Toyota Hilux SRX", 2026, "Pick-up", "PT-05", "Disponible", "Diésel", "Aut. 6-Vel", "2.8L Turbo D", new BigDecimal("49500"), "https://leasyauto.com/static/uploads/233a57e9-4b2f-4566-878c-6921474d1ade.jpeg", "2.8L D-4D 4x4 Automática · Plata Metalizado", "Nave 1 - Bahía A-02", 4)
                ));
            }

            List<Reservation> allReservations = reservations.findAll();
            Set<String> pendingVins = allReservations.stream()
                    .filter(reservation -> "Pendiente".equalsIgnoreCase(reservation.getStatus()))
                    .map(reservation -> reservation.getVehicle().getVin())
                    .collect(Collectors.toSet());
            Set<String> completedVins = allReservations.stream()
                    .filter(reservation -> "Concretada".equalsIgnoreCase(reservation.getStatus()))
                    .map(reservation -> reservation.getVehicle().getVin())
                    .collect(Collectors.toSet());
            vehicles.findAll().stream()
                    .filter(vehicle -> "Vendido".equalsIgnoreCase(vehicle.getStatus())
                            || "Reservado".equalsIgnoreCase(vehicle.getStatus()))
                    .filter(vehicle -> vehicle.getStock() == 0)
                    .filter(vehicle -> completedVins.contains(vehicle.getVin()))
                    .filter(vehicle -> !pendingVins.contains(vehicle.getVin()))
                    .forEach(vehicle -> {
                        vehicle.restoreAvailabilityAfterCompletedReservation();
                        vehicles.save(vehicle);
                    });
        };
    }
}
