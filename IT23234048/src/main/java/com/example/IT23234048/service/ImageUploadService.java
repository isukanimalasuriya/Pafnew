package com.example.IT23234048.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${ticket.upload.path}")
    private String uploadPath;

    public List<String> uploadImages(List<MultipartFile> files) throws IOException {
        List<String> fileUrls = new ArrayList<>();
        
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        for (MultipartFile file : files) {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            
            if (!extension.equals(".jpg") && !extension.equals(".png") && !extension.equals(".jpeg")) {
                throw new IllegalArgumentException("Only JPG/PNG files are allowed");
            }
            
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new IllegalArgumentException("File size must not exceed 5MB");
            }

            String newFileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadDir.resolve(newFileName);
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                
                // Return local URL
                String fileUrl = "http://localhost:8080/uploads/tickets/" + newFileName;
                fileUrls.add(fileUrl);
            }
        }
        
        return fileUrls;
    }
}
