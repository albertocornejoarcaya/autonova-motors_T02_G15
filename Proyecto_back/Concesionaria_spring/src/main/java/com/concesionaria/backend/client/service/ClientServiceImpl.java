package com.concesionaria.backend.client.service;

import com.concesionaria.backend.client.dto.ClientResponse;
import com.concesionaria.backend.client.dto.CreateClientRequest;
import com.concesionaria.backend.client.repository.ClientRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClientServiceImpl implements ClientService {
    private final ClientRepository clients;

    public ClientServiceImpl(ClientRepository clients) {
        this.clients = clients;
    }

    @Override
    public List<ClientResponse> listClients() {
        return clients.findAll().stream().map(ClientResponse::from).toList();
    }

    @Override
    public ClientResponse getClient(Long id) {
        return clients.findById(id).map(ClientResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    @Override
    public ClientResponse createClient(CreateClientRequest request) {
        if (clients.existsByDni(request.dni()) || clients.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "DNI or email already registered");
        }
        return ClientResponse.from(clients.save(request.toEntity()));
    }
}
