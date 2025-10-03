package com.examly.springapp.repository;

import com.examly.springapp.model.RetakePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RetakePermissionRepository extends JpaRepository<RetakePermission, Long> {
    List<RetakePermission> findByStudentNameAndActive(String studentName, Boolean active);
    List<RetakePermission> findByActive(Boolean active);
    List<RetakePermission> findByStudentNameAndQuizIdAndActive(String studentName, Long quizId, Boolean active);
}