package com.applicationtracker.market.service;

import com.applicationtracker.market.dto.MarketFeedResponse;
import com.applicationtracker.market.dto.MarketJobResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class UsaJobsMarketService {
    private static final String USA_JOBS_SOURCE_NAME = "USAJOBS Search API";
    private static final String USA_JOBS_SOURCE_URL = "https://developer.usajobs.gov/api-reference/get-api-search";
    private static final String USA_JOBS_SEARCH_ENDPOINT = "https://data.usajobs.gov/api/Search";
    private static final String DEFAULT_ERROR = "USAJOBS feed unavailable. Showing a curated US engineering snapshot.";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String userAgent;
    private final String apiKey;

    public UsaJobsMarketService(
            ObjectMapper objectMapper,
            @Value("${app.usajobs.user-agent:}") String userAgent,
            @Value("${app.usajobs.api-key:}") String apiKey
    ) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.userAgent = userAgent;
        this.apiKey = apiKey;
    }

    public MarketFeedResponse getUsEngineeringMarketFeed() {
        if (userAgent.isBlank() || apiKey.isBlank()) {
            return fallback("USAJOBS credentials not configured. Add app.usajobs.user-agent and app.usajobs.api-key for live US federal job data.");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder(buildSearchUri())
                    .header("Host", "data.usajobs.gov")
                    .header("User-Agent", userAgent)
                    .header("Authorization-Key", apiKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return fallback("USAJOBS returned status " + response.statusCode() + ". Showing a curated US engineering snapshot.");
            }

            List<MarketJobResponse> jobs = parseJobs(response.body());
            if (jobs.isEmpty()) {
                return fallback("USAJOBS returned no matching US engineering roles. Showing a curated US engineering snapshot.");
            }

            return new MarketFeedResponse(
                    USA_JOBS_SOURCE_NAME,
                    USA_JOBS_SOURCE_URL,
                    false,
                    "",
                    jobs
            );
        } catch (Exception ex) {
            return fallback(DEFAULT_ERROR);
        }
    }

    private URI buildSearchUri() {
        String query = "JobCategoryCode=" + encode("2210")
                + "&Keyword=" + encode("software")
                + "&WhoMayApply=" + encode("public")
                + "&ResultsPerPage=18"
                + "&SortField=" + encode("openingdate")
                + "&SortDirection=Desc";
        return URI.create(USA_JOBS_SEARCH_ENDPOINT + "?" + query);
    }

    private List<MarketJobResponse> parseJobs(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode items = root.path("SearchResult").path("SearchResultItems");
        if (!items.isArray()) {
            return List.of();
        }

        List<MarketJobResponse> jobs = new ArrayList<>();
        for (JsonNode item : items) {
            JsonNode descriptor = item.path("MatchedObjectDescriptor");
            String title = descriptor.path("PositionTitle").asText("").trim();
            if (title.isBlank()) {
                continue;
            }

            String companyName = descriptor.path("OrganizationName").asText("USAJOBS").trim();
            String location = descriptor.path("PositionLocationDisplay").asText("United States").trim();
            String createdAt = descriptor.path("PublicationStartDate").asText("");
            String url = descriptor.path("PositionURI").asText("").trim();
            if (url.isBlank() && descriptor.path("ApplyURI").isArray() && descriptor.path("ApplyURI").size() > 0) {
                url = descriptor.path("ApplyURI").get(0).asText("").trim();
            }
            if (url.isBlank()) {
                url = "https://www.usajobs.gov/";
            }

            jobs.add(new MarketJobResponse(
                    title,
                    companyName,
                    location,
                    deriveTags(title),
                    url,
                    createdAt
            ));
        }

        return jobs;
    }

    private List<String> deriveTags(String title) {
        String normalized = title.toLowerCase(Locale.ROOT);
        Set<String> tags = new LinkedHashSet<>();
        tags.add("Federal");

        if (normalized.contains("software")) tags.add("Software");
        if (normalized.contains("data")) tags.add("Data");
        if (normalized.contains("security") || normalized.contains("infosec")) tags.add("Security");
        if (normalized.contains("network")) tags.add("Network");
        if (normalized.contains("cloud")) tags.add("Cloud");
        if (normalized.contains("devops")) tags.add("DevOps");
        if (normalized.contains("frontend")) tags.add("Frontend");
        if (normalized.contains("backend")) tags.add("Backend");
        if (normalized.contains("platform")) tags.add("Platform");

        if (tags.size() == 1) {
            tags.add("Engineering");
        }

        return tags.stream().limit(4).toList();
    }

    private MarketFeedResponse fallback(String message) {
        return new MarketFeedResponse(
                USA_JOBS_SOURCE_NAME,
                USA_JOBS_SOURCE_URL,
                true,
                message,
                fallbackJobs()
        );
    }

    private List<MarketJobResponse> fallbackJobs() {
        return List.of(
                new MarketJobResponse(
                        "IT Specialist (Application Software)",
                        "Department of the Air Force",
                        "San Antonio, TX",
                        List.of("Federal", "Software", "Backend"),
                        "https://www.usajobs.gov/",
                        "2026-04-12T09:00:00.000Z"
                ),
                new MarketJobResponse(
                        "IT Specialist (INFOSEC)",
                        "Department of Homeland Security",
                        "Washington, DC",
                        List.of("Federal", "Security", "Engineering"),
                        "https://www.usajobs.gov/",
                        "2026-04-13T11:30:00.000Z"
                ),
                new MarketJobResponse(
                        "IT Specialist (SYSADMIN/CUSTSPT)",
                        "Department of Veterans Affairs",
                        "Austin, TX",
                        List.of("Federal", "Platform", "Cloud"),
                        "https://www.usajobs.gov/",
                        "2026-04-11T16:15:00.000Z"
                ),
                new MarketJobResponse(
                        "Data Engineer",
                        "Department of Commerce",
                        "Chicago, IL",
                        List.of("Federal", "Data", "Engineering"),
                        "https://www.usajobs.gov/",
                        "2026-04-10T14:45:00.000Z"
                ),
                new MarketJobResponse(
                        "Computer Engineer",
                        "Naval Sea Systems Command",
                        "San Diego, CA",
                        List.of("Federal", "Engineering", "Systems"),
                        "https://www.usajobs.gov/",
                        "2026-04-09T08:20:00.000Z"
                ),
                new MarketJobResponse(
                        "IT Specialist (APPSW)",
                        "Internal Revenue Service",
                        "Remote / United States",
                        List.of("Federal", "Software", "Remote"),
                        "https://www.usajobs.gov/",
                        "2026-04-08T10:10:00.000Z"
                )
        );
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
