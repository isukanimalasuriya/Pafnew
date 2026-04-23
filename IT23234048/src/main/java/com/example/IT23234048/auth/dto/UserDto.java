package com.example.IT23234048.auth.dto;

import com.example.IT23234048.auth.model.Role;

public record UserDto(String id, String name, String email, Role role) {}

