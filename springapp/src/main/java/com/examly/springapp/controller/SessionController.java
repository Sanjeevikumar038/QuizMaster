package com.examly.springapp.controller;

import com.examly.springapp.model.UserSession;
import com.examly.springapp.repository.UserSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = {"http://localhost:3000", "https://quizmastersk.netlify.app"})
public class SessionController {

    @Autowired
    private UserSessionRepository userSessionRepository;

    @PostMapping("/login")
    public ResponseEntity<UserSession> createSession(@RequestBody UserSession sessionRequest) {
        try {
            String sessionToken = UUID.randomUUID().toString();
            
            UserSession session = new UserSession();
            session.setUsername(sessionRequest.getUsername());
            session.setUserRole(sessionRequest.getUserRole());
            session.setSessionToken(sessionToken);
            session.setCreatedAt(new Date());
            session.setExpiresAt(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000));
            session.setActive(true);
            
            UserSession savedSession = userSessionRepository.save(session);
            return ResponseEntity.ok(savedSession);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{sessionToken}")
    public ResponseEntity<UserSession> getSession(@PathVariable String sessionToken) {
        return userSessionRepository.findBySessionTokenAndActive(sessionToken, true)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{sessionToken}")
    public ResponseEntity<Void> logout(@PathVariable String sessionToken) {
        userSessionRepository.findBySessionTokenAndActive(sessionToken, true)
                .ifPresent(session -> {
                    session.setActive(false);
                    userSessionRepository.save(session);
                });
        return ResponseEntity.ok().build();
    }
}