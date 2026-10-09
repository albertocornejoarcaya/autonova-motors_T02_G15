package com.concesionaria.backend.client.dto;

import com.concesionaria.backend.client.entity.Client;

public record ClientResponse(Long id, String firstName, String lastName, String dni,
                             String phone, String email, String address) {
    public static ClientResponse from(Client client) {
        return new ClientResponse(client.getId(), client.getFirstName(), client.getLastName(),
                client.getDni(), client.getPhone(), client.getEmail(), client.getAddress());
    }
}
