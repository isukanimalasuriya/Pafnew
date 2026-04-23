package com.example.IT23234048;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class It23234048Application {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(It23234048Application.class, args);
	}

	private static void loadEnv() {
		try {
			java.nio.file.Path envFile = java.nio.file.Paths.get(".env");
			if (java.nio.file.Files.exists(envFile)) {
				try (java.io.BufferedReader reader = java.nio.file.Files.newBufferedReader(envFile)) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) continue;
						String[] parts = line.split("=", 2);
						if (parts.length == 2) {
							System.setProperty(parts[0].trim(), parts[1].trim());
						}
					}
				}
			}
		} catch (Exception e) {
			System.err.println("Failed to load .env: " + e.getMessage());
		}
	}


}
