package com.skillswap.nexus.dto.response;

import com.skillswap.nexus.model.SessionMode;
import com.skillswap.nexus.model.SkillType;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SkillResponse {
    Long id;
    String title;
    String category;
    String description;
    SkillType type;
    SessionMode deliveryMode;
    Integer weeklyHours;
    Boolean active;
    LocalDateTime createdAt;
    Long ownerId;
    String ownerName;
    String ownerDepartment;
}
