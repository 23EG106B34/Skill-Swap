package com.skillswap.nexus.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserResponse {
    Long id;
    String fullName;
    String email;
    String department;
    Integer yearOfStudy;
    String bio;
    LocalDateTime createdAt;
}
