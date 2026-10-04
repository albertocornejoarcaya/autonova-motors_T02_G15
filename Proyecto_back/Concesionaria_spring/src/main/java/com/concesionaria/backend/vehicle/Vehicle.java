package com.concesionaria.backend.vehicle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @Column(length = 17, nullable = false, updatable = false)
    private String vin;
    @Column(nullable = false) private String makeModel;
    @Column(name = "model_year", nullable = false) private int year;
    @Column(nullable = false) private String category;
    private String lot;
    private String status;
    private String fuel;
    private String transmission;
    private String engine;
    private BigDecimal price;
    private String imageUrl;
    private String specifications;
    private String location;
    private int stock;

    protected Vehicle() { }

    public Vehicle(String vin, String makeModel, int year, String category, String lot,
                   String status, String fuel, String transmission, String engine,
                   BigDecimal price, String imageUrl, String specifications, String location, int stock) {
        this.vin = vin;
        this.makeModel = makeModel;
        this.year = year;
        this.category = category;
        this.lot = lot;
        this.status = status;
        this.fuel = fuel;
        this.transmission = transmission;
        this.engine = engine;
        this.price = price;
        this.imageUrl = imageUrl;
        this.specifications = specifications;
        this.location = location;
        this.stock = stock;
    }

    public String getVin() { return vin; }
    public String getMakeModel() { return makeModel; }
    public int getYear() { return year; }
    public String getCategory() { return category; }
    public String getLot() { return lot; }
    public String getStatus() { return status; }
    public String getFuel() { return fuel; }
    public String getTransmission() { return transmission; }
    public String getEngine() { return engine; }
    public BigDecimal getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public String getSpecifications() { return specifications; }
    public String getLocation() { return location; }
    public int getStock() { return stock; }

    public void updateInventory(String status, String location, int stock) {
        this.status = status;
        this.location = location;
        this.stock = stock;
    }

    public void reserveOne() {
        if (stock < 1 || !"Disponible".equalsIgnoreCase(status)) {
            throw new IllegalStateException("El vehículo no está disponible para reservar");
        }
        stock--;
        if (stock == 0) {
            status = "Reservado";
        }
    }

    /** Al concretar la venta, si ya no quedan unidades la ficha pasa a "Vendido". */
    public void markSoldIfDepleted() {
        if (stock == 0) {
            status = "Vendido";
        }
    }

    public void releaseReservation() {
        stock++;
        if ("Reservado".equalsIgnoreCase(status)) {
            status = "Disponible";
        }
    }
}
