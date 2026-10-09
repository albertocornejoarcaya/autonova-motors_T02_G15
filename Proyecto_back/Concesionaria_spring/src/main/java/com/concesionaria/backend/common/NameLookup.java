package com.concesionaria.backend.common;

import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

import com.concesionaria.backend.client.entity.Client;
import com.concesionaria.backend.client.repository.ClientRepository;
import com.concesionaria.backend.user.entity.StaffUser;
import com.concesionaria.backend.user.repository.StaffUserRepository;

/**
 * Resuelve nombres legibles de clientes y usuarios para enriquecer las respuestas
 * de reservas y ventas (evita mostrar solo "Cliente #1" en la interfaz).
 */
@Component
public class NameLookup {
    private final ClientRepository clients;
    private final StaffUserRepository users;

    public NameLookup(ClientRepository clients, StaffUserRepository users) {
        this.clients = clients;
        this.users = users;
    }

    public Map<Long, String> clientNames() {
        return clients.findAll().stream()
                .collect(Collectors.toMap(Client::getId, NameLookup::clientFullName, (left, right) -> left));
    }

    public Map<Long, String> userNames() {
        return users.findAll().stream()
                .collect(Collectors.toMap(StaffUser::getId, NameLookup::userFullName, (left, right) -> left));
    }

    public String clientName(Long id) {
        return id == null ? null : clients.findById(id).map(NameLookup::clientFullName).orElse(null);
    }

    public String userName(Long id) {
        return id == null ? null : users.findById(id).map(NameLookup::userFullName).orElse(null);
    }

    private static String clientFullName(Client client) {
        return client.getFirstName() + " " + client.getLastName();
    }

    private static String userFullName(StaffUser user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}
