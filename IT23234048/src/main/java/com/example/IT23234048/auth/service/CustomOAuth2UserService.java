package com.example.IT23234048.auth.service;

import com.example.IT23234048.auth.model.User;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUserService delegate = new OidcUserService();
        OidcUser oidcUser;
        try {
            oidcUser = delegate.loadUser(userRequest);
        } catch (Exception e) {
            log.error("Failed to load OIDC user from Google: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException(new OAuth2Error("google_load_failed"), e.getMessage(), e);
        }

        // Claims come from the OIDC ID token — copy them so we can add our appUserId
        Map<String, Object> claims = new HashMap<>(oidcUser.getClaims());

        log.debug("Google OIDC claims received: keys={}", claims.keySet());

        String email = oidcUser.getEmail();
        String name  = oidcUser.getFullName();

        if (email == null || email.isBlank()) {
            log.error("OIDC login failed: email not present in claims. Keys: {}", claims.keySet());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("missing_email"), "Google did not return an email address");
        }

        User user;
        try {
            user = userService.upsertOAuthUser(name == null ? email : name, email);
        } catch (Exception e) {
            log.error("Failed to upsert OAuth user for email={}: {}", email, e.getMessage(), e);
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("user_upsert_failed"), "Failed to create or update user: " + e.getMessage(), e);
        }

        log.info("OIDC login: user={} (id={}, status={})", email, user.getId(), user.getStatus());

        // Inject our internal userId into the claims map
        claims.put("appUserId", user.getId());

        // Build a new OidcUserInfo from the enriched claims
        org.springframework.security.oauth2.core.oidc.OidcUserInfo enrichedUserInfo = 
            new org.springframework.security.oauth2.core.oidc.OidcUserInfo(claims);

        // Build a new OidcUser with the enriched claims. 
        // DefaultOidcUser will combine idToken and userInfo claims.
        return new DefaultOidcUser(oidcUser.getAuthorities(), oidcUser.getIdToken(), enrichedUserInfo, "email");
    }
}
