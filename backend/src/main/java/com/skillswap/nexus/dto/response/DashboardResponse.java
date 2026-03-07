package com.skillswap.nexus.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardResponse {
    long activeUsers;
    long activeSkills;
    long incomingPendingRequests;
    long outgoingPendingRequests;
    List<SkillMatchResponse> recommendations;
}
