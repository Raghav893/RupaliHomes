package com.raghav.rupaliconstbackend.config;

import com.raghav.rupaliconstbackend.Repositories.PropertyRepository;
import com.raghav.rupaliconstbackend.Repositories.UserRepository;
import com.raghav.rupaliconstbackend.entity.Property;
import com.raghav.rupaliconstbackend.entity.PropertyStatus;
import com.raghav.rupaliconstbackend.entity.PropertyType;
import com.raghav.rupaliconstbackend.entity.Role;
import com.raghav.rupaliconstbackend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@rupalihomes.com");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        if (propertyRepository.count() < 3) {
            User admin = userRepository.findAll().get(0);

            // Buy Property 1
            Property p1 = new Property();
            p1.setTitle("Luxury Villa in DLF Phase 1");
            p1.setDescription("A magnificent 5-bedroom villa with a private pool, imported marble flooring, and smart home automation. Situated in the heart of Gurgaon's most prestigious neighborhood.");
            p1.setPrice(new BigDecimal("150000000")); // 15 Cr
            p1.setLocation("DLF Phase 1, Gurgaon");
            p1.setSize("5000");
            p1.setType(PropertyType.SALE);
            p1.setStatus(PropertyStatus.AVAILABLE);
            p1.setCreatedBy(admin);
            p1.setImageUrl("https://images.unsplash.com/photo-1613490493576-7fde63acd811");
            p1.setBedrooms(5);
            p1.setBathrooms(6);
            p1.setSqft(5000);
            p1.setFeatured(true);
            p1.setCity("Gurgaon");
            p1.setPropertyCategory("Villa");
            p1.setAgentName("Rahul Sharma");
            p1.setReactionsCount(12);
            propertyRepository.save(p1);

            // Buy Property 2
            Property p2 = new Property();
            p2.setTitle("Premium Apartment in Golf Course Ext");
            p2.setDescription("Spacious 4BHK apartment in a high-growth corridor. Features a modular kitchen, expansive balconies with golf course views, and premium club amenities.");
            p2.setPrice(new BigDecimal("45000000")); // 4.5 Cr
            p2.setLocation("Golf Course Extension, Gurgaon");
            p2.setSize("3200");
            p2.setType(PropertyType.SALE);
            p2.setStatus(PropertyStatus.AVAILABLE);
            p2.setCreatedBy(admin);
            p2.setImageUrl("https://images.unsplash.com/photo-1512917774080-9991f1c4c750");
            p2.setBedrooms(4);
            p2.setBathrooms(4);
            p2.setSqft(3200);
            p2.setFeatured(true);
            p2.setCity("Gurgaon");
            p2.setPropertyCategory("Apartment");
            p2.setAgentName("Priya Singh");
            p2.setReactionsCount(5);
            propertyRepository.save(p2);
            
            // Buy Property 3
            Property p3 = new Property();
            p3.setTitle("Modern Penthouse overlooking Aravallis");
            p3.setDescription("Top-floor penthouse featuring 270-degree panoramic views of the Aravalli hills. Triplex layout with private elevator and terrace garden.");
            p3.setPrice(new BigDecimal("80000000")); // 8 Cr
            p3.setLocation("Sector 59, Gurgaon");
            p3.setSize("4500");
            p3.setType(PropertyType.SALE);
            p3.setStatus(PropertyStatus.AVAILABLE);
            p3.setCreatedBy(admin);
            p3.setImageUrl("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9");
            p3.setBedrooms(4);
            p3.setBathrooms(5);
            p3.setSqft(4500);
            p3.setFeatured(true);
            p3.setCity("Gurgaon");
            p3.setPropertyCategory("Penthouse");
            p3.setAgentName("Rahul Sharma");
            p3.setReactionsCount(24);
            propertyRepository.save(p3);
        }
    }
}
