package com.example.IT23234048.dto;

public class ResourceDTO {

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;

    public ResourceDTO() {
    }

    public ResourceDTO(String name, String type, Integer capacity, String location, String status) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
