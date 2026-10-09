package com.concesionaria.backend.client.service;

import com.concesionaria.backend.client.dto.ClientResponse;
import com.concesionaria.backend.client.dto.CreateClientRequest;
import java.util.List;

public interface ClientService {
    List<ClientResponse> listClients();
    ClientResponse getClient(Long id);
    ClientResponse createClient(CreateClientRequest request);
}
