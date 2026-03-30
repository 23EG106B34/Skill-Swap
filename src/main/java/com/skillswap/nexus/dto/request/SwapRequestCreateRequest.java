package com.skillswap.nexus.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SwapRequestCreateRequest {

    @NotNull
    private Long senderId;

    @NotNull
    private Long receiverId;

    @NotNull
    private Long offeredSkillId;

    @NotNull
    private Long requestedSkillId;

    @Size(max = 1000)
    private String message;
}
