package com.luv2code.ecommerce.dto;

import lombok.Data;
import lombok.NonNull;

@Data
public class PurchaseResponse {
    @NonNull
    private String orderTrackingNumber;// lombok data will generate constructor for final fields, so use @NonNull or final
}
