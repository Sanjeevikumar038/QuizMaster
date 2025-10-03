package com.examly.springapp.controller;

import com.examly.springapp.model.RetakePermission;
import com.examly.springapp.repository.RetakePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/retake-permissions")
@CrossOrigin(origins = "http://localhost:3000")
public class PermissionController {

    @Autowired
    private RetakePermissionRepository retakePermissionRepository;

    @PostMapping
    public ResponseEntity<RetakePermission> allowRetake(@RequestBody RetakePermission permission) {
        try {
            RetakePermission newPermission = new RetakePermission();
            newPermission.setStudentName(permission.getStudentName());
            newPermission.setQuizId(permission.getQuizId());
            newPermission.setQuizTitle(permission.getQuizTitle());
            newPermission.setAllowedAt(new Date());
            newPermission.setActive(true);
            
            RetakePermission saved = retakePermissionRepository.save(newPermission);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<RetakePermission>> getAllPermissions() {
        List<RetakePermission> permissions = retakePermissionRepository.findByActive(true);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/student/{studentName}")
    public ResponseEntity<List<RetakePermission>> getStudentPermissions(@PathVariable String studentName) {
        List<RetakePermission> permissions = retakePermissionRepository.findByStudentNameAndActive(studentName, true);
        return ResponseEntity.ok(permissions);
    }
}