package com.concesionaria.backend.sale.service;

import com.concesionaria.backend.sale.dto.CreateSaleRequest;
import com.concesionaria.backend.sale.dto.SaleResponse;
import jakarta.servlet.http.HttpSession;
import java.util.List;

public interface SaleService {
    List<SaleResponse> listSales();
    SaleResponse completeSale(CreateSaleRequest request, HttpSession session);
}
