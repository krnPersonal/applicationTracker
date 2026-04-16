package com.applicationtracker.market.dto;

import java.util.List;

public record MarketJobResponse(
        String title,
        String companyName,
        String location,
        List<String> tags,
        String url,
        String createdAt
) {
}
