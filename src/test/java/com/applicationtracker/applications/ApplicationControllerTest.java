package com.applicationtracker.applications;

import com.applicationtracker.applications.dto.ApplicationCreateRequest;
import com.applicationtracker.applications.dto.ApplicationUpdateRequest;
import com.applicationtracker.auth.dto.LoginRequest;
import com.applicationtracker.auth.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndLogin(String email) throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setEmail(email);
        register.setFirstName("Test");
        register.setLastName("User");
        register.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        LoginRequest login = new LoginRequest();
        login.setEmail(email);
        login.setPassword("password123");

        String token = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(token).get("token").asText();
    }

    private long createApplication(String jwt, String email) throws Exception {
        ApplicationCreateRequest create = new ApplicationCreateRequest();
        create.setFullName("Test User");
        create.setEmail(email);
        create.setPhone("1234567890");
        create.setPosition("Engineer");
        create.setStatus("APPLIED");
        create.setCoverLetter("Hi");
        create.setYearsExperience(2);
        create.setAppliedDate(LocalDate.now());
        create.setWorkType("Onsite");
        create.setSalaryExpectation(90000);
        create.setNotes("Notes");
        create.setPortfolioUrl("https://example.com");
        create.setLinkedinUrl("https://linkedin.com/in/example");
        create.setRemoteOk(true);

        String created = mockMvc.perform(post("/api/applications")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(created).get("id").asLong();
    }

    @Test
    void application_crud_flow() throws Exception {
        String jwt = registerAndLogin("appuser@example.com");
        long id = createApplication(jwt, "appuser@example.com");

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        ApplicationUpdateRequest update = new ApplicationUpdateRequest();
        update.setStatus("REVIEW");

        mockMvc.perform(put("/api/applications/" + id)
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVIEW"));

        mockMvc.perform(delete("/api/applications/" + id)
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
    }

    @Test
    void resume_upload_download_and_report() throws Exception {
        String jwt = registerAndLogin("resumeuser@example.com");
        long id = createApplication(jwt, "resumeuser@example.com");

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "fake-pdf-content".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/applications/" + id + "/resume")
                        .file(file)
                        .param("category", "Engineering")
                        .param("subcategory", "Backend")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumeFileName").value("resume.pdf"))
                .andExpect(jsonPath("$.resumeContentType").value(MediaType.APPLICATION_PDF_VALUE))
                .andExpect(jsonPath("$.resumeSize").exists());

        mockMvc.perform(get("/api/applications/" + id + "/resume")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(result -> Assertions.assertTrue(
                        result.getResponse().getContentAsByteArray().length > 0));

        mockMvc.perform(get("/api/applications/report")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(result -> Assertions.assertTrue(
                        result.getResponse().getContentAsByteArray().length > 0));
    }

    @Test
    void forbidden_access_to_other_users_application() throws Exception {
        String ownerJwt = registerAndLogin("owner@example.com");
        String otherJwt = registerAndLogin("other@example.com");
        long id = createApplication(ownerJwt, "owner@example.com");

        mockMvc.perform(get("/api/applications/" + id)
                        .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/applications/" + id)
                        .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isForbidden());
    }
}
