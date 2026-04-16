package com.applicationtracker.market.dto;

import java.util.List;

public record MarketFeedResponse(
        String sourceName,
        String sourceUrl,
        boolean usingFallback,
        String message,
        List<MarketJobResponse> jobs
) {
}
