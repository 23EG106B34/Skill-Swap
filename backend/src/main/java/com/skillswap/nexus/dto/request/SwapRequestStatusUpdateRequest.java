package com.skillswap.nexus.dto.request;

import com.skillswap.nexus.model.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SwapRequestStatusUpdateRequest {

    @NotNull
    private Long actorId;

    @NotNull
    private RequestStatus status;
}
