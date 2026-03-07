package com.skillswap.nexus.service;

import com.skillswap.nexus.dto.response.DashboardResponse;
import com.skillswap.nexus.model.RequestStatus;
import com.skillswap.nexus.repository.SkillRepository;
import com.skillswap.nexus.repository.SkillRequestRepository;
import com.skillswap.nexus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SkillRequestRepository skillRequestRepository;
    private final SkillService skillService;

    public DashboardService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            SkillRequestRepository skillRequestRepository,
            SkillService skillService
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.skillRequestRepository = skillRequestRepository;
        this.skillService = skillService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboardForUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new com.skillswap.nexus.exception.NotFoundException("User not found: " + userId));

        return DashboardResponse.builder()
                .activeUsers(userRepository.count())
                .activeSkills(skillRepository.countByActiveTrue())
                .incomingPendingRequests(skillRequestRepository.countByReceiverIdAndStatus(userId, RequestStatus.PENDING))
                .outgoingPendingRequests(skillRequestRepository.countBySenderIdAndStatus(userId, RequestStatus.PENDING))
                .recommendations(skillService.getRecommendationsForUser(userId))
                .build();
    }
}
