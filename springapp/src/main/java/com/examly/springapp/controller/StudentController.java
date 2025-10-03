package com.examly.springapp.controller;
import com.examly.springapp.model.Student;
import com.examly.springapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:3000", "https://quizmastersk.netlify.app"})
public class StudentController {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        return ResponseEntity.ok(students);
    }
    
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        try {
            student.setCreatedAt(new java.util.Date());
            student.setUpdatedAt(new java.util.Date());
            if (student.getActive() == null) {
                student.setActive(true);
            }
            if (student.getDeleted() == null) {
                student.setDeleted(false);
            }
            Student savedStudent = studentRepository.save(student);
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            System.err.println("Error creating student: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Student> updateStudentStatus(@PathVariable Long id, @RequestBody Student statusUpdate) {
        return studentRepository.findById(id)
                .map(student -> {
                    if (statusUpdate.getActive() != null) {
                        student.setActive(statusUpdate.getActive());
                    }
                    if (statusUpdate.getDeleted() != null) {
                        student.setDeleted(statusUpdate.getDeleted());
                    }
                    student.setUpdatedAt(new java.util.Date());
                    return ResponseEntity.ok(studentRepository.save(student));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(student -> {
                    student.setDeleted(true);
                    student.setActive(false);
                    student.setUpdatedAt(new java.util.Date());
                    studentRepository.save(student);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/login")
    public ResponseEntity<Student> login(@RequestBody LoginRequest loginRequest) {
        Student student = studentRepository.findByUsernameAndPassword(
            loginRequest.getUsername(), loginRequest.getPassword());
        
        if (student != null && student.getActive() && !student.getDeleted()) {
            return ResponseEntity.ok(student);
        }
        return ResponseEntity.status(401).build();
    }
    
    public static class LoginRequest {
        private String username;
        private String password;
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}