package com.example.IT23234048.auth.repository;

import com.example.IT23234048.auth.model.Role;
import com.example.IT23234048.auth.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
}
