package com.skillswap.nexus.config;

import com.skillswap.nexus.model.RequestStatus;
import com.skillswap.nexus.model.SessionMode;
import com.skillswap.nexus.model.Skill;
import com.skillswap.nexus.model.SkillRequest;
import com.skillswap.nexus.model.SkillType;
import com.skillswap.nexus.model.User;
import com.skillswap.nexus.repository.SkillRepository;
import com.skillswap.nexus.repository.SkillRequestRepository;
import com.skillswap.nexus.repository.UserRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SkillRequestRepository skillRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            SkillRepository skillRepository,
            SkillRequestRepository skillRequestRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.skillRequestRepository = skillRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        User anaya = userRepository.save(User.builder()
                .fullName("Anaya Rao")
                .email("anaya@campus.dev")
                .passwordHash(passwordEncoder.encode("pass1234"))
                .department("Computer Science")
                .yearOfStudy(3)
                .bio("Frontend engineer who loves product design and micro-interactions.")
                .build());

        User rehan = userRepository.save(User.builder()
                .fullName("Rehan Ali")
                .email("rehan@campus.dev")
                .passwordHash(passwordEncoder.encode("pass1234"))
                .department("Electronics")
                .yearOfStudy(4)
                .bio("Embedded systems enthusiast exploring practical AI and robotics.")
                .build());

        User mira = userRepository.save(User.builder()
                .fullName("Mira Sharma")
                .email("mira@campus.dev")
                .passwordHash(passwordEncoder.encode("pass1234"))
                .department("Mechanical")
                .yearOfStudy(2)
                .bio("Interested in CAD, rapid prototyping, and startup pitching.")
                .build());

        Skill reactMentoring = skillRepository.save(Skill.builder()
                .title("React UI mentoring")
                .category("React")
                .description("Hands-on mentoring for state management, reusable components, and clean architecture.")
                .type(SkillType.OFFERING)
                .deliveryMode(SessionMode.HYBRID)
                .weeklyHours(4)
                .active(true)
                .owner(anaya)
                .build());

        Skill figmaLearning = skillRepository.save(Skill.builder()
                .title("Learn Figma systems")
                .category("Design")
                .description("Need help creating scalable design systems and handoff-ready prototypes.")
                .type(SkillType.LEARNING)
                .deliveryMode(SessionMode.ONLINE)
                .weeklyHours(3)
                .active(true)
                .owner(anaya)
                .build());

        Skill pythonOffering = skillRepository.save(Skill.builder()
                .title("Python for automation")
                .category("Python")
                .description("Can teach scripts for scraping, data cleanup, and simple backend utilities.")
                .type(SkillType.OFFERING)
                .deliveryMode(SessionMode.ONLINE)
                .weeklyHours(3)
                .active(true)
                .owner(rehan)
                .build());

        Skill reactLearning = skillRepository.save(Skill.builder()
                .title("Need React guidance")
                .category("React")
                .description("Preparing for internships and looking for practical React project guidance.")
                .type(SkillType.LEARNING)
                .deliveryMode(SessionMode.HYBRID)
                .weeklyHours(4)
                .active(true)
                .owner(rehan)
                .build());

        Skill cadOffering = skillRepository.save(Skill.builder()
                .title("SolidWorks coaching")
                .category("CAD")
                .description("Can teach CAD modeling for product prototyping and simulations.")
                .type(SkillType.OFFERING)
                .deliveryMode(SessionMode.OFFLINE)
                .weeklyHours(2)
                .active(true)
                .owner(mira)
                .build());

        Skill pythonLearning = skillRepository.save(Skill.builder()
                .title("Learn Python basics")
                .category("Python")
                .description("Want to learn enough Python to automate repetitive lab report tasks.")
                .type(SkillType.LEARNING)
                .deliveryMode(SessionMode.ONLINE)
                .weeklyHours(2)
                .active(true)
                .owner(mira)
                .build());

        SkillRequest warmStart = SkillRequest.builder()
                .sender(rehan)
                .receiver(anaya)
                .offeredSkill(pythonOffering)
                .requestedSkill(reactMentoring)
                .message("I can mentor Python automation if you guide me on React architecture.")
                .status(RequestStatus.PENDING)
                .build();

        skillRequestRepository.saveAll(List.of(warmStart));

    }
}
