package com.example.IT23234048.auth.service;

import com.example.IT23234048.auth.model.User;
import java.util.HashMap;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(userRequest);

        // getAttributes() returns an immutable map — copy it before mutating
        Map<String, Object> attrs = new HashMap<>(oauth2User.getAttributes());

        String email = attrs.get("email") == null ? null : attrs.get("email").toString();
        String name  = attrs.get("name")  == null ? null : attrs.get("name").toString();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Missing email from OAuth2 provider");
        }

        User user = userService.upsertOAuthUser(name == null ? email : name, email);

        // Inject our internal userId so the success handler can generate a JWT
        attrs.put("appUserId", user.getId());

        return new DefaultOAuth2User(oauth2User.getAuthorities(), attrs, "email");
    }
}
