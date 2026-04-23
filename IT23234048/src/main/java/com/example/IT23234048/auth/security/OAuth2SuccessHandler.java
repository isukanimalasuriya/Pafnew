package com.example.IT23234048.auth.security;

import com.example.IT23234048.auth.model.User;
import com.example.IT23234048.auth.service.JwtService;
import com.example.IT23234048.auth.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
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
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid OAuth2 principal");
            return;
        }

        Object appUserId = oauth2User.getAttribute("appUserId");
        if (appUserId == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing app user id");
            return;
        }

        User user = userService.findById(appUserId.toString()).orElse(null);
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User not found");
            return;
        }

        if (!user.isActive()) {
            String errorMsg = "Account+suspended+by+an+administrator";
            if ("PENDING".equals(user.getStatus())) {
                errorMsg = "Your+account+is+pending+admin+approval";
            }
            response.sendRedirect(frontendRedirectBase + "?error=" + errorMsg);
            return;
        }

        String token = jwtService.generateToken(user);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendRedirectBase)
                .queryParam("token", token)
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
