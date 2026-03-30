package com.skillswap.nexus.dto.response;

import com.skillswap.nexus.model.RequestStatus;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SwapRequestResponse {
    Long id;
    RequestStatus status;
    String message;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    Long senderId;
    String senderName;
    Long receiverId;
    String receiverName;

    Long offeredSkillId;
    String offeredSkillTitle;
    String offeredSkillCategory;

    Long requestedSkillId;
    String requestedSkillTitle;
    String requestedSkillCategory;
}
