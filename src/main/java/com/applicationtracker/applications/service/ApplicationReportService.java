package com.applicationtracker.applications.service;

import com.applicationtracker.applications.entity.JobApplication;
import com.applicationtracker.applications.repository.JobApplicationRepository;
import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;

import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ApplicationReportService {
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationReportService(JobApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public byte[] generateUserReport(String email) {
        User user = getUserOrThrow(email);
        List<JobApplication> applications = applicationRepository.findByUserId(user.getId());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);

            document.open();
            document.add(new Paragraph("Application Report for " + email));
            document.add(new Paragraph("User: " + email));
            document.add(new Paragraph(""));

            PdfPTable table = buildTable(applications);

            document.add(table);
            document.close();
            return out.toByteArray();


        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate report");
        }
    }

    private PdfPTable buildTable(List<JobApplication> applications) {
        PdfPTable table = new PdfPTable(6);

        table.addCell("ID");
        table.addCell("Full Name");
        table.addCell("Position");
        table.addCell("Status");
        table.addCell("Experience");
        table.addCell("Created At");

        for (JobApplication app : applications) {
            table.addCell(String.valueOf(app.getId()));
            table.addCell(app.getFullName());
            table.addCell(app.getPosition());
            table.addCell(app.getStatus());
            table.addCell(String.valueOf(app.getYearsExperience()));
            table.addCell(app.getCreatedAt().toString());
        }

        return table;
    }
}
