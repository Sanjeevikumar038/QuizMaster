package com.examly.springapp.repository;

import com.examly.springapp.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findBySessionTokenAndActive(String sessionToken, Boolean active);
    Optional<UserSession> findByUsernameAndActive(String username, Boolean active);
}