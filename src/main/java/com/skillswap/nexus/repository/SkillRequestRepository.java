package com.skillswap.nexus.repository;

import com.skillswap.nexus.model.RequestStatus;
import com.skillswap.nexus.model.SkillRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRequestRepository extends JpaRepository<SkillRequest, Long> {

    List<SkillRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<SkillRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    long countByReceiverIdAndStatus(Long receiverId, RequestStatus status);

    long countBySenderIdAndStatus(Long senderId, RequestStatus status);
}
