package com.raghav.rupaliconstbackend.controller;

import com.raghav.rupaliconstbackend.entity.Inquiry;
import com.raghav.rupaliconstbackend.repository.InquiryRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/leads")
public class CsvExportController {

    private final InquiryRepository inquiryRepository;

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public void exportLeadsCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"leads.csv\"");

        List<Inquiry> inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        PrintWriter writer = response.getWriter();

        // CSV Header
        writer.println("ID,Name,Phone,Alternate Phone,Email,Type,City,Property Type,Message,Status,Created At");

        for (Inquiry inquiry : inquiries) {
            writer.println(String.join(",",
                    escapeCsv(String.valueOf(inquiry.getId())),
                    escapeCsv(inquiry.getName()),
                    escapeCsv(inquiry.getPhone()),
                    escapeCsv(inquiry.getAlternatePhone()),
                    escapeCsv(inquiry.getEmail()),
                    escapeCsv(inquiry.getType()),
                    escapeCsv(inquiry.getCity()),
                    escapeCsv(inquiry.getPropertyType()),
                    escapeCsv(inquiry.getMessage()),
                    escapeCsv(inquiry.getStatus()),
                    escapeCsv(inquiry.getCreatedAt() != null ? inquiry.getCreatedAt().format(fmt) : "")
            ));
        }
        writer.flush();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        // Escape double quotes and wrap in quotes if contains comma, newline, or quote
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
