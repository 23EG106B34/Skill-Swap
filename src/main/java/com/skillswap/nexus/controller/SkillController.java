package com.skillswap.nexus.controller;

import com.skillswap.nexus.dto.request.SkillCreateRequest;
import com.skillswap.nexus.dto.response.SkillMatchResponse;
import com.skillswap.nexus.dto.response.SkillResponse;
import com.skillswap.nexus.model.SkillType;
import com.skillswap.nexus.service.SkillService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping("/marketplace")
    public List<SkillResponse> getMarketplace() {
        return skillService.getMarketplaceSkills();
    }

    @GetMapping("/type/{type}")
    public List<SkillResponse> byType(@PathVariable SkillType type) {
        return skillService.getSkillsByType(type);
    }

    @GetMapping("/owner/{ownerId}")
    public List<SkillResponse> byOwner(@PathVariable Long ownerId) {
        return skillService.getSkillsByOwner(ownerId);
    }

    @GetMapping("/recommendations/{userId}")
    public List<SkillMatchResponse> recommendations(@PathVariable Long userId) {
        return skillService.getRecommendationsForUser(userId);
    }

    @PostMapping("/owner/{ownerId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse create(@PathVariable Long ownerId, @Valid @RequestBody SkillCreateRequest request) {
        return skillService.createSkill(ownerId, request);
    }
}
