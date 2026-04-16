package com.applicationtracker.config;

import com.applicationtracker.applications.entity.JobApplication;
import com.applicationtracker.applications.repository.JobApplicationRepository;
import com.applicationtracker.user.entity.User;
import com.applicationtracker.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final boolean seedDemoData;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            @Value("${app.seed-demo-data:false}") boolean seedDemoData,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.seedDemoData = seedDemoData;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedDemoData || userRepository.count() > 0 || jobApplicationRepository.count() > 0) {
            return;
        }

        User demoUser = new User();
        demoUser.setEmail("demo@applicationtracker.dev");
        demoUser.setFirstName("Kiran");
        demoUser.setLastName("Rai");
        demoUser.setPhone("555-0101");
        demoUser.setTitle("Software Engineer");
        demoUser.setPassword(passwordEncoder.encode("password123"));
        demoUser.setRole("USER");
        demoUser = userRepository.save(demoUser);

        jobApplicationRepository.save(buildApplication(
                demoUser,
                "Avery Brooks",
                "avery@demo.dev",
                "555-0102",
                "Frontend Engineer",
                "Remote",
                "APPLIED",
                LocalDate.now().minusDays(8),
                3,
                120000,
                true,
                "Strong product design team and modern React stack."
        ));

        jobApplicationRepository.save(buildApplication(
                demoUser,
                "Jordan Lee",
                "jordan@demo.dev",
                "555-0103",
                "Platform Engineer",
                "Hybrid",
                "INTERVIEW",
                LocalDate.now().minusDays(15),
                5,
                135000,
                false,
                "Phone screen complete. Prep systems design follow-up."
        ));

        jobApplicationRepository.save(buildApplication(
                demoUser,
                "Morgan Patel",
                "morgan@demo.dev",
                "555-0104",
                "Full Stack Developer",
                "Onsite",
                "OFFER",
                LocalDate.now().minusDays(24),
                4,
                128000,
                false,
                "Offer received. Reviewing compensation and team scope."
        ));
    }

    private JobApplication buildApplication(
            User user,
            String fullName,
            String email,
            String phone,
            String position,
            String workType,
            String status,
            LocalDate appliedDate,
            int yearsExperience,
            int salaryExpectation,
            boolean remoteOk,
            String notes
    ) {
        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setFullName(fullName);
        application.setEmail(email);
        application.setPhone(phone);
        application.setPosition(position);
        application.setAppliedDate(appliedDate);
        application.setWorkType(workType);
        application.setStatus(status);
        application.setCoverLetter("Interested in the role and aligned with the team mission.");
        application.setYearsExperience(yearsExperience);
        application.setAvailableFrom(LocalDate.now().plusWeeks(2));
        application.setSalaryExpectation(salaryExpectation);
        application.setNotes(notes);
        application.setPortfolioUrl("https://portfolio.example.com/" + fullName.toLowerCase().replace(" ", "-"));
        application.setLinkedinUrl("https://linkedin.com/in/" + fullName.toLowerCase().replace(" ", "-"));
        application.setRemoteOk(remoteOk);
        application.setCreatedAt(LocalDateTime.now().minusDays(Math.max(1, LocalDate.now().toEpochDay() - appliedDate.toEpochDay())));
        if (!"APPLIED".equals(status)) {
            application.setResumeUploadedAt(LocalDateTime.now().minusDays(3));
        }
        return application;
    }
}
