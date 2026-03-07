package com.skillswap.nexus.dto.request;

import com.skillswap.nexus.model.SessionMode;
import com.skillswap.nexus.model.SkillType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SkillCreateRequest {

    @NotBlank
    @Size(max = 160)
    private String title;

    @NotBlank
    @Size(max = 80)
    private String category;

    @NotBlank
    @Size(max = 1200)
    private String description;

    @NotNull
    private SkillType type;

    @NotNull
    private SessionMode deliveryMode;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer weeklyHours;
}
