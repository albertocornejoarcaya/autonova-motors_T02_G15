package com.concesionaria.backend.sale.controller;

import com.concesionaria.backend.sale.dto.CreateSaleRequest;
import com.concesionaria.backend.sale.dto.SaleResponse;
import com.concesionaria.backend.sale.service.SaleService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<SaleResponse> list() {
        return saleService.listSales();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SaleResponse complete(@Valid @RequestBody CreateSaleRequest request, HttpSession session) {
        return saleService.completeSale(request, session);
    }
}