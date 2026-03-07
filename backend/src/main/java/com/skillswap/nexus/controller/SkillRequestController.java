package com.skillswap.nexus.controller;

import com.skillswap.nexus.dto.request.SwapRequestCreateRequest;
import com.skillswap.nexus.dto.request.SwapRequestStatusUpdateRequest;
import com.skillswap.nexus.dto.response.SwapRequestResponse;
import com.skillswap.nexus.service.SkillRequestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests")
public class SkillRequestController {

    private final SkillRequestService skillRequestService;

    public SkillRequestController(SkillRequestService skillRequestService) {
        this.skillRequestService = skillRequestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SwapRequestResponse create(@Valid @RequestBody SwapRequestCreateRequest request) {
        return skillRequestService.createRequest(request);
    }

    @GetMapping("/inbox/{userId}")
    public List<SwapRequestResponse> inbox(@PathVariable Long userId) {
        return skillRequestService.getInbox(userId);
    }

    @GetMapping("/outbox/{userId}")
    public List<SwapRequestResponse> outbox(@PathVariable Long userId) {
        return skillRequestService.getOutbox(userId);
    }

    @PatchMapping("/{requestId}")
    public SwapRequestResponse updateStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody SwapRequestStatusUpdateRequest request
    ) {
        return skillRequestService.updateStatus(requestId, request);
    }
}
