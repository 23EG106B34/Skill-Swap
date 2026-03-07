package com.skillswap.nexus.service;

import com.skillswap.nexus.dto.request.SkillCreateRequest;
import com.skillswap.nexus.dto.response.SkillMatchResponse;
import com.skillswap.nexus.dto.response.SkillResponse;
import com.skillswap.nexus.exception.NotFoundException;
import com.skillswap.nexus.model.SessionMode;
import com.skillswap.nexus.model.Skill;
import com.skillswap.nexus.model.SkillType;
import com.skillswap.nexus.model.User;
import com.skillswap.nexus.repository.SkillRepository;
import com.skillswap.nexus.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public SkillService(SkillRepository skillRepository, UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SkillResponse createSkill(Long ownerId, SkillCreateRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("User not found: " + ownerId));

        Skill skill = Skill.builder()
                .title(request.getTitle().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .type(request.getType())
                .deliveryMode(request.getDeliveryMode())
                .weeklyHours(request.getWeeklyHours())
                .active(true)
                .owner(owner)
                .build();

        return toResponse(skillRepository.save(skill));
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getMarketplaceSkills() {
        return skillRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByType(SkillType type) {
        return skillRepository.findByTypeAndActiveTrueOrderByCreatedAtDesc(type).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByOwner(Long ownerId) {
        return skillRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SkillMatchResponse> getRecommendationsForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        List<Skill> mySkills = skillRepository.findByOwnerIdOrderByCreatedAtDesc(userId).stream()
                .filter(Skill::getActive)
                .toList();

        Set<String> learningCategories = mySkills.stream()
                .filter(skill -> skill.getType() == SkillType.LEARNING)
                .map(skill -> normalizeCategory(skill.getCategory()))
                .collect(java.util.stream.Collectors.toSet());

        Set<String> offeringCategories = mySkills.stream()
                .filter(skill -> skill.getType() == SkillType.OFFERING)
                .map(skill -> normalizeCategory(skill.getCategory()))
                .collect(java.util.stream.Collectors.toSet());

        return skillRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(skill -> !skill.getOwner().getId().equals(userId))
                .map(skill -> toMatchResponse(skill, learningCategories, offeringCategories))
                .sorted((left, right) -> Integer.compare(right.getMatchScore(), left.getMatchScore()))
                .limit(8)
                .toList();
    }

    @Transactional(readOnly = true)
    public Skill getSkillEntityById(Long skillId) {
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new NotFoundException("Skill not found: " + skillId));
    }

    public SkillResponse toResponse(Skill skill) {
        User owner = skill.getOwner();
        return SkillResponse.builder()
                .id(skill.getId())
                .title(skill.getTitle())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .type(skill.getType())
                .deliveryMode(skill.getDeliveryMode())
                .weeklyHours(skill.getWeeklyHours())
                .active(skill.getActive())
                .createdAt(skill.getCreatedAt())
                .ownerId(owner.getId())
                .ownerName(owner.getFullName())
                .ownerDepartment(owner.getDepartment())
                .build();
    }

    private SkillMatchResponse toMatchResponse(
            Skill skill,
            Set<String> learningCategories,
            Set<String> offeringCategories
    ) {
        int score = 42;
        String category = normalizeCategory(skill.getCategory());
        String reason = "Good cross-campus collaboration opportunity";

        if (skill.getType() == SkillType.OFFERING && learningCategories.contains(category)) {
            score += 36;
            reason = "Direct match for what you want to learn";
        } else if (skill.getType() == SkillType.LEARNING && offeringCategories.contains(category)) {
            score += 36;
            reason = "You can likely help this learner immediately";
        } else if (learningCategories.contains(category) || offeringCategories.contains(category)) {
            score += 18;
            reason = "Category overlaps with your current skill map";
        }

        if (skill.getDeliveryMode() == SessionMode.HYBRID) {
            score += 8;
        }

        if (skill.getWeeklyHours() <= 4) {
            score += 6;
        }

        score = Math.min(score, 98);

        return SkillMatchResponse.builder()
                .skill(toResponse(skill))
                .matchScore(score)
                .reason(reason)
                .build();
    }

    private String normalizeCategory(String category) {
        return category == null ? "" : category.trim().toLowerCase(Locale.ROOT);
    }
}
