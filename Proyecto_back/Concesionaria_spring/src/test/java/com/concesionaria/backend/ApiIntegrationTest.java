package com.concesionaria.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.concesionaria.backend.client.dto.ClientResponse;
import com.concesionaria.backend.client.dto.CreateClientRequest;
import com.concesionaria.backend.client.entity.Client;
import com.concesionaria.backend.client.repository.ClientRepository;
import com.concesionaria.backend.reservation.dto.CreateReservationRequest;
import com.concesionaria.backend.reservation.repository.ReservationRepository;
import com.concesionaria.backend.sale.dto.CreateSaleRequest;
import com.concesionaria.backend.sale.dto.SaleResponse;
import com.concesionaria.backend.reservation.dto.ReservationResponse;
import com.concesionaria.backend.reservation.dto.UpdateReservationDateRequest;
import com.concesionaria.backend.user.dto.CreateStaffUserRequest;
import com.concesionaria.backend.user.dto.LoginRequest;
import com.concesionaria.backend.user.entity.StaffUser;
import com.concesionaria.backend.user.repository.StaffUserRepository;
import com.concesionaria.backend.user.dto.UpdateStaffUserRequest;
import com.concesionaria.backend.vehicle.dto.VehicleResponse;
import com.concesionaria.backend.vehicle.entity.Vehicle;
import com.concesionaria.backend.vehicle.repository.VehicleRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:concesionaria-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.h2.console.enabled=false"
})
class ApiIntegrationTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private StaffUserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

        @Autowired
        private ReservationRepository reservations;

        @Autowired
        private ClientRepository clients;

        @Autowired
        private VehicleRepository vehicles;

    @BeforeEach
    void createAdminUser() {
        users.deleteAll();
        users.save(new StaffUser("Test", "Admin", "12345678", "admin@test.local",
                passwordEncoder.encode("Password123"), 1, true));
    }

    @Test
    void catalogIsPublicAndContainsSeedVehicles() {
        ResponseEntity<VehicleResponse[]> response = rest.getForEntity(url("/api/vehicles"), VehicleResponse[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(6);
    }

    @Test
    void swaggerUiAndOpenApiSpecificationAreAvailable() {
        ResponseEntity<String> swaggerUi = rest.getForEntity(url("/swagger-ui/index.html"), String.class);
        ResponseEntity<String> openApi = rest.getForEntity(url("/v3/api-docs"), String.class);

        assertThat(swaggerUi.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(swaggerUi.getBody()).contains("Swagger UI");
        assertThat(openApi.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(openApi.getBody()).contains("\"openapi\"", "\"/api/clients\"");
    }

    @Test
    void userManagementRequiresAdminSession() {
        ResponseEntity<String> anonymousResponse = rest.getForEntity(url("/api/users"), String.class);
        assertThat(anonymousResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        ResponseEntity<String> anonymousClientsResponse = rest.getForEntity(url("/api/clients"), String.class);
        assertThat(anonymousClientsResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        HttpHeaders loginHeaders = new HttpHeaders();
        loginHeaders.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                new HttpEntity<>(new LoginRequest("admin@test.local", "Password123"), loginHeaders), String.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).isNotNull();
        HttpHeaders authenticatedHeaders = new HttpHeaders();
        authenticatedHeaders.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);
        ResponseEntity<String> authenticatedResponse = rest.exchange(url("/api/users"), HttpMethod.GET,
                new HttpEntity<>(authenticatedHeaders), String.class);

        assertThat(authenticatedResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        ResponseEntity<String> authenticatedClientsResponse = rest.exchange(url("/api/clients"), HttpMethod.GET,
                new HttpEntity<>(authenticatedHeaders), String.class);
        assertThat(authenticatedClientsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

        @Test
        void currentUserRequiresSessionAndReturnsRoleForAuthenticatedSession() {
                ResponseEntity<String> anonymousResponse = rest.getForEntity(url("/api/auth/me"), String.class);
                assertThat(anonymousResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

                ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                                new LoginRequest("admin@test.local", "Password123"), String.class);
                String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
                HttpHeaders authenticatedHeaders = new HttpHeaders();
                authenticatedHeaders.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

                ResponseEntity<String> currentUserResponse = rest.exchange(url("/api/auth/me"), HttpMethod.GET,
                                new HttpEntity<>(authenticatedHeaders), String.class);

                assertThat(currentUserResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(currentUserResponse.getBody()).contains("admin@test.local", "Test", "Admin", "roleId", "1");
        }

    @Test
    void warehouseUserCannotReadReservations() {
        users.save(new StaffUser("Warehouse", "User", "87654321", "warehouse@test.local",
                passwordEncoder.encode("Password123"), 3, true));
        ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                new LoginRequest("warehouse@test.local", "Password123"), String.class);
        String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

        ResponseEntity<String> reservationsResponse = rest.exchange(url("/api/reservations"), HttpMethod.GET,
                new HttpEntity<>(headers), String.class);
        ResponseEntity<String> salesResponse = rest.exchange(url("/api/sales"), HttpMethod.GET,
                new HttpEntity<>(headers), String.class);

        assertThat(reservationsResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(salesResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void administratorCanCreateStaffUser() {
        ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                new LoginRequest("admin@test.local", "Password123"), String.class);
        String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

        ResponseEntity<String> createResponse = rest.exchange(url("/api/users"), HttpMethod.POST,
                new HttpEntity<>(new CreateStaffUserRequest(
                        "New", "Staff", "11223344", "new.staff@test.local", "Password123", 2, true), headers),
                String.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(users.findByEmailIgnoreCase("new.staff@test.local")).isPresent();
    }

    @Test
    void clientCanBeReservedByAuthenticatedSalesUser() {
        ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                new LoginRequest("admin@test.local", "Password123"), String.class);
        String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

        ResponseEntity<ClientResponse> clientResponse = rest.postForEntity(url("/api/clients"),
                new CreateClientRequest("Test", "Customer", "87654321",
                        "999000111", "customer@test.local", "Lima"), ClientResponse.class);
        assertThat(clientResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(clientResponse.getBody()).isNotNull();

        ResponseEntity<ReservationResponse> reservationResponse = rest.exchange(url("/api/reservations"),
                HttpMethod.POST,
                new HttpEntity<>(new CreateReservationRequest("3TMAZ5CN8KM104928",
                        clientResponse.getBody().id(), LocalDate.of(2026, 10, 1), true, "Integration test"), headers),
                ReservationResponse.class);
        assertThat(reservationResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(reservationResponse.getBody().status()).isEqualTo("Pendiente");
        assertThat(reservationResponse.getBody().userId())
                .isEqualTo(users.findByEmailIgnoreCase("admin@test.local").orElseThrow().getId());
        assertThat(reservationResponse.getBody().reservationDate()).isEqualTo(LocalDate.of(2026, 10, 1));
        assertThat(reservationResponse.getBody().notifyCustomer()).isTrue();

        ResponseEntity<ReservationResponse[]> reservationListResponse = rest.exchange(url("/api/reservations"),
                HttpMethod.GET, new HttpEntity<>(headers), ReservationResponse[].class);
        assertThat(reservationListResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reservationListResponse.getBody()).extracting(ReservationResponse::reservationDate)
                .contains(LocalDate.of(2026, 10, 1));

        ResponseEntity<String> duplicateWhilePending = rest.exchange(url("/api/reservations"), HttpMethod.POST,
                new HttpEntity<>(new CreateReservationRequest("3TMAZ5CN8KM104928",
                        clientResponse.getBody().id(), LocalDate.of(2026, 10, 1), true,
                        "Duplicate pending reservation"), headers), String.class);
        assertThat(duplicateWhilePending.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        ResponseEntity<ReservationResponse> updatedReservation = rest.exchange(
                url("/api/reservations/" + reservationResponse.getBody().id() + "/date"), HttpMethod.PUT,
                new HttpEntity<>(new UpdateReservationDateRequest(
                        LocalDate.of(2026, 10, 8)), headers), ReservationResponse.class);
        assertThat(updatedReservation.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updatedReservation.getBody().reservationDate()).isEqualTo(LocalDate.of(2026, 10, 8));

        var finalAmount = new java.math.BigDecimal("37500.00");
        ResponseEntity<SaleResponse> saleResponse = rest.exchange(
                url("/api/sales"), HttpMethod.POST,
                new HttpEntity<>(new CreateSaleRequest(
                        reservationResponse.getBody().id(), finalAmount), headers),
                SaleResponse.class);
        assertThat(saleResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(saleResponse.getBody().finalAmount()).isEqualByComparingTo(finalAmount);
        assertThat(saleResponse.getBody().sellerId())
                .isEqualTo(users.findByEmailIgnoreCase("admin@test.local").orElseThrow().getId());
        assertThat(reservations.findById(reservationResponse.getBody().id()).orElseThrow().getStatus())
                .isEqualTo("Concretada");
        ResponseEntity<SaleResponse[]> salesResponse = rest.exchange(
                url("/api/sales"), HttpMethod.GET, new HttpEntity<>(headers),
                SaleResponse[].class);
        assertThat(salesResponse.getBody()).hasSize(1);
        ResponseEntity<String> duplicateSale = rest.exchange(url("/api/sales"), HttpMethod.POST,
                new HttpEntity<>(new CreateSaleRequest(
                        reservationResponse.getBody().id(), finalAmount), headers), String.class);
        assertThat(duplicateSale.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        var availableVehicle = vehicles.findById("3TMAZ5CN8KM104928").orElseThrow();
        assertThat(availableVehicle.getStock()).isEqualTo(1);
        assertThat(availableVehicle.getStatus()).isEqualTo("Disponible");

        ResponseEntity<ReservationResponse> secondReservation = rest.exchange(url("/api/reservations"),
                HttpMethod.POST,
                new HttpEntity<>(new CreateReservationRequest("3TMAZ5CN8KM104928",
                        clientResponse.getBody().id(), LocalDate.of(2026, 10, 1), true,
                        "Reservation after completion"), headers), ReservationResponse.class);
        assertThat(secondReservation.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        ResponseEntity<String> duplicateReservation = rest.exchange(url("/api/reservations"), HttpMethod.POST,
                new HttpEntity<>(new CreateReservationRequest("3TMAZ5CN8KM104928",
                        clientResponse.getBody().id(), LocalDate.of(2026, 10, 1), true,
                        "Duplicate pending reservation"), headers), String.class);
        assertThat(duplicateReservation.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

        @Test
        void pendingReservationCanBeCancelledAndRestoresVehicleStockOnce() {
                ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                                new LoginRequest("admin@test.local", "Password123"), String.class);
                String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

        Client client = clients.save(new Client("Cancel", "Customer", "23456789", "999111222",
                "cancel.customer@test.local", "Lima"));
        Vehicle vehicle = vehicles.save(new Vehicle("9BWZZZ377VT004251", "Test Sedan", 2026, "Sedán",
                "TEST-01", "Disponible", "Gasolina", "Manual", "1.8L", new BigDecimal("25000.00"),
                null, "Vehículo de prueba", "Patio de prueba", 1));

        ResponseEntity<ReservationResponse> createResponse = rest.exchange(url("/api/reservations"),
                HttpMethod.POST,
                new HttpEntity<>(new CreateReservationRequest(vehicle.getVin(), client.getId(),
                        LocalDate.now(), false, "Cancellation test"), headers),
                ReservationResponse.class);
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(vehicles.findById(vehicle.getVin()).orElseThrow().getStock()).isZero();

        ResponseEntity<ReservationResponse> cancelResponse = rest.exchange(
                url("/api/reservations/" + createResponse.getBody().id() + "/cancel"), HttpMethod.POST,
                new HttpEntity<>(headers), ReservationResponse.class);
        assertThat(cancelResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cancelResponse.getBody().status()).isEqualTo("Cancelada");

        Vehicle restoredVehicle = vehicles.findById(vehicle.getVin()).orElseThrow();
        assertThat(restoredVehicle.getStock()).isEqualTo(1);
        assertThat(restoredVehicle.getStatus()).isEqualTo("Disponible");

        ResponseEntity<String> duplicateCancel = rest.exchange(
                url("/api/reservations/" + createResponse.getBody().id() + "/cancel"), HttpMethod.POST,
                new HttpEntity<>(headers), String.class);
        assertThat(duplicateCancel.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(vehicles.findById(vehicle.getVin()).orElseThrow().getStock()).isEqualTo(1);

        reservations.deleteById(createResponse.getBody().id());
        clients.delete(client);
        vehicles.delete(vehicle);
        }

    @Test
    void administratorCanEditAndDeleteUsersButCannotRemoveLastAdmin() {
        StaffUser secondary = users.save(new StaffUser("Sales", "Rep", "87654321", "sales@test.local",
                passwordEncoder.encode("Password123"), 2, true));
        ResponseEntity<String> loginResponse = rest.postForEntity(url("/api/auth/login"),
                new LoginRequest("admin@test.local", "Password123"), String.class);
        String setCookie = loginResponse.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, setCookie.split(";", 2)[0]);

        ResponseEntity<String> updateResponse = rest.exchange(url("/api/users/" + secondary.getId()), HttpMethod.PUT,
                new HttpEntity<>(new UpdateStaffUserRequest("Sales", "Updated", 3, true), headers), String.class);
        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(users.findById(secondary.getId()).orElseThrow().getRoleId()).isEqualTo(3);

        ResponseEntity<String> deleteResponse = rest.exchange(url("/api/users/" + secondary.getId()), HttpMethod.DELETE,
                new HttpEntity<>(headers), String.class);
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<String> deactivateLastAdmin = rest.exchange(url("/api/users/" + users.findByEmailIgnoreCase("admin@test.local").orElseThrow().getId()),
                HttpMethod.PUT, new HttpEntity<>(new UpdateStaffUserRequest("Test", "Admin", 1, false), headers), String.class);
        assertThat(deactivateLastAdmin.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void invalidClientReturnsReadableSpanishError() {
        ResponseEntity<String> response = rest.postForEntity(url("/api/clients"),
                new CreateClientRequest("Bad", "Dni", "123",
                        "999000111", "bad.dni@test.local", "Lima"), String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("\"message\"", "dni", "8 dígitos");
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }
}
