package com.example.IT23234048;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class It23234048ApplicationTests {

	static {
		loadEnv();
	}

	private static void loadEnv() {
		try {
			java.nio.file.Path envFile = java.nio.file.Paths.get(".env");
			if (!java.nio.file.Files.exists(envFile)) {
				envFile = java.nio.file.Paths.get("IT23234048/.env");
			}
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
			System.err.println("Failed to load .env in tests: " + e.getMessage());
		}
	}

	@Test
	void contextLoads() {
	}

}
