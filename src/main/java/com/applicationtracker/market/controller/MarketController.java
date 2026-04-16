package com.applicationtracker.market.controller;

import com.applicationtracker.market.dto.MarketFeedResponse;
import com.applicationtracker.market.service.UsaJobsMarketService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
public class MarketController {
    private final UsaJobsMarketService usaJobsMarketService;

    public MarketController(UsaJobsMarketService usaJobsMarketService) {
        this.usaJobsMarketService = usaJobsMarketService;
    }

    @GetMapping("/us-jobs")
    public MarketFeedResponse getUsJobs() {
        return usaJobsMarketService.getUsEngineeringMarketFeed();
    }
}
