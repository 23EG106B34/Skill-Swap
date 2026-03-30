package com.skillswap.nexus.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SkillMatchResponse {
    SkillResponse skill;
    int matchScore;
    String reason;
}
