package com.skillswap.nexus.repository;

import com.skillswap.nexus.model.Skill;
import com.skillswap.nexus.model.SkillType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByTypeAndActiveTrueOrderByCreatedAtDesc(SkillType type);

    List<Skill> findByActiveTrueOrderByCreatedAtDesc();

    List<Skill> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByActiveTrue();
}
