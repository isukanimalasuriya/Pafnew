package com.example.IT23234048.auth.security;

import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.service.JwtService;
import com.example.IT23234048.auth.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private static final Logger log = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final JwtService jwtService;
    private final UserService userService;
    private final String frontendRedirectBase;

    public OAuth2SuccessHandler(
            JwtService jwtService,
            UserService userService,
            @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}") String frontendRedirectBase
    ) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.frontendRedirectBase = frontendRedirectBase;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            log.error("OAuth2 success: principal is not OAuth2User, type={}", authentication.getPrincipal().getClass().getName());
            redirect(response, "Google sign-in failed. Please try again.");
            return;
        }

        Object appUserId = oauth2User.getAttribute("appUserId");
        log.info("OAuth2 success: attribute keys={}, appUserId={}", oauth2User.getAttributes().keySet(), appUserId);

        if (appUserId == null) {
            log.error("OAuth2 success: appUserId is null. Keys present: {}", oauth2User.getAttributes().keySet());
            redirect(response, "Sign-in failed: could not link Google account. Please try again.");
            return;
        }

        User user = userService.findById(appUserId.toString()).orElse(null);
        if (user == null) {
            log.error("OAuth2 success: no DB user found for appUserId={}", appUserId);
            redirect(response, "Account not found. Please register first.");
            return;
        }

        if (!user.isActive()) {
            String errorMsg;
            if ("PENDING".equals(user.getStatus())) {
                errorMsg = "Your account is pending admin approval. You will receive an email once approved.";
            } else {
                errorMsg = "Your account has been suspended. Please contact an administrator.";
            }
            log.warn("OAuth2 login blocked: user={} status={}", user.getEmail(), user.getStatus());
            redirect(response, errorMsg);
            return;
        }

        String token = jwtService.generateToken(user);
        log.info("OAuth2 login successful for user={}", user.getEmail());

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendRedirectBase)
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private void redirect(HttpServletResponse response, String errorMsg) throws IOException {
        String url = UriComponentsBuilder
                .fromUriString(frontendRedirectBase)
                .queryParam("error", errorMsg)
                .build()
                .toUriString();
        response.sendRedirect(url);
    }
}
