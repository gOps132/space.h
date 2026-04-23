package com.spaceh.resource;

import com.spaceh.common.persistence.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "study_resource")
public class StudyResource extends BaseEntity {

    @Column(name = "resource_name", nullable = false, length = 120)
    private String resourceName;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 40)
    private ResourceType resourceType;

    @Column(name = "zone_location", nullable = false, length = 80)
    private String zoneLocation;

    @Column(nullable = false)
    private int floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private ResourceStatus status;

    @Column(name = "has_power_outlet", nullable = false)
    private boolean hasPowerOutlet;

    @Column
    private Integer capacity;

    @Column(name = "faculty_exclusive", nullable = false)
    private boolean facultyExclusive;

    protected StudyResource() {
    }

    public StudyResource(
            String resourceName,
            ResourceType resourceType,
            String zoneLocation,
            int floor,
            ResourceStatus status,
            boolean hasPowerOutlet,
            Integer capacity,
            boolean facultyExclusive
    ) {
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.zoneLocation = zoneLocation;
        this.floor = floor;
        this.status = status;
        this.hasPowerOutlet = hasPowerOutlet;
        this.capacity = capacity;
        this.facultyExclusive = facultyExclusive;
    }

    public String getResourceName() {
        return resourceName;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public String getZoneLocation() {
        return zoneLocation;
    }

    public int getFloor() {
        return floor;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public boolean isHasPowerOutlet() {
        return hasPowerOutlet;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public boolean isFacultyExclusive() {
        return facultyExclusive;
    }
}
