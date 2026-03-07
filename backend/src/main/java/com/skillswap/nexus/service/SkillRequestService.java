package com.skillswap.nexus.service;

import com.skillswap.nexus.dto.request.SwapRequestCreateRequest;
import com.skillswap.nexus.dto.request.SwapRequestStatusUpdateRequest;
import com.skillswap.nexus.dto.response.SwapRequestResponse;
import com.skillswap.nexus.exception.BadRequestException;
import com.skillswap.nexus.exception.NotFoundException;
import com.skillswap.nexus.exception.UnauthorizedException;
import com.skillswap.nexus.model.RequestStatus;
import com.skillswap.nexus.model.Skill;
import com.skillswap.nexus.model.SkillRequest;
import com.skillswap.nexus.model.SkillType;
import com.skillswap.nexus.model.User;
import com.skillswap.nexus.repository.SkillRequestRepository;
import com.skillswap.nexus.repository.SkillRepository;
import com.skillswap.nexus.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillRequestService {

    private final SkillRequestRepository skillRequestRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public SkillRequestService(
            SkillRequestRepository skillRequestRepository,
            UserRepository userRepository,
            SkillRepository skillRepository
    ) {
        this.skillRequestRepository = skillRequestRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional
    public SwapRequestResponse createRequest(SwapRequestCreateRequest request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new NotFoundException("Sender not found: " + request.getSenderId()));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new NotFoundException("Receiver not found: " + request.getReceiverId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new BadRequestException("Sender and receiver cannot be the same user");
        }

        Skill offeredSkill = skillRepository.findById(request.getOfferedSkillId())
                .orElseThrow(() -> new NotFoundException("Offered skill not found: " + request.getOfferedSkillId()));

        Skill requestedSkill = skillRepository.findById(request.getRequestedSkillId())
                .orElseThrow(() -> new NotFoundException("Requested skill not found: " + request.getRequestedSkillId()));

        if (!offeredSkill.getOwner().getId().equals(sender.getId())) {
            throw new BadRequestException("Offered skill must belong to sender");
        }

        if (!requestedSkill.getOwner().getId().equals(receiver.getId())) {
            throw new BadRequestException("Requested skill must belong to receiver");
        }

        if (offeredSkill.getType() != SkillType.OFFERING || requestedSkill.getType() != SkillType.OFFERING) {
            throw new BadRequestException("Both selected skills must be marked as OFFERING");
        }

        if (!Boolean.TRUE.equals(offeredSkill.getActive()) || !Boolean.TRUE.equals(requestedSkill.getActive())) {
            throw new BadRequestException("Only active skills can be used in a swap request");
        }

        SkillRequest skillRequest = SkillRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .offeredSkill(offeredSkill)
                .requestedSkill(requestedSkill)
                .message(trimOrNull(request.getMessage()))
                .status(RequestStatus.PENDING)
                .build();

        return toResponse(skillRequestRepository.save(skillRequest));
    }

    @Transactional(readOnly = true)
    public List<SwapRequestResponse> getInbox(Long userId) {
        return skillRequestRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SwapRequestResponse> getOutbox(Long userId) {
        return skillRequestRepository.findBySenderIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SwapRequestResponse updateStatus(Long requestId, SwapRequestStatusUpdateRequest request) {
        SkillRequest existingRequest = skillRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found: " + requestId));

        if (existingRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be updated");
        }

        if (request.getStatus() == RequestStatus.CANCELLED) {
            if (!existingRequest.getSender().getId().equals(request.getActorId())) {
                throw new UnauthorizedException("Only sender can cancel a request");
            }
        } else {
            if (!existingRequest.getReceiver().getId().equals(request.getActorId())) {
                throw new UnauthorizedException("Only receiver can accept or reject this request");
            }
            if (request.getStatus() != RequestStatus.ACCEPTED && request.getStatus() != RequestStatus.REJECTED) {
                throw new BadRequestException("Receiver can only set ACCEPTED or REJECTED status");
            }
        }

        existingRequest.setStatus(request.getStatus());
        return toResponse(skillRequestRepository.save(existingRequest));
    }

    public SwapRequestResponse toResponse(SkillRequest request) {
        return SwapRequestResponse.builder()
                .id(request.getId())
                .status(request.getStatus())
                .message(request.getMessage())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .senderId(request.getSender().getId())
                .senderName(request.getSender().getFullName())
                .receiverId(request.getReceiver().getId())
                .receiverName(request.getReceiver().getFullName())
                .offeredSkillId(request.getOfferedSkill().getId())
                .offeredSkillTitle(request.getOfferedSkill().getTitle())
                .offeredSkillCategory(request.getOfferedSkill().getCategory())
                .requestedSkillId(request.getRequestedSkill().getId())
                .requestedSkillTitle(request.getRequestedSkill().getTitle())
                .requestedSkillCategory(request.getRequestedSkill().getCategory())
                .build();
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
