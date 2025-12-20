export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
    MASTER_ADMIN = 'masteradmin',
}

export enum AvailabilityStatus {
    AVAILABLE = "available",
    UNAVAILABLE = "unavailable",
    BOOKED = "booked"
}

export enum EnrollmentStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    DROPPED = 'dropped'
}

export enum DrillType {
    TIME = "TIME",
    SCORE = "SCORE",
    ACCURACY = "ACCURACY"
}

export enum SleepQuality {
    POOR = "POOR",
    AVERAGE = "AVERAGE",
    GREAT = "GREAT"
}

export enum PreStressLevel {
    LOW = "LOW",
    MODERATE = "MODERATE",
    HIGH = "HIGH"
}

export enum PostStressLevel {
    LESS_STRESSED = "LESS_STRESSED",
    SAME = "SAME",
    MORE_STRESSED = "MORE_STRESSED"
}

export enum SessionStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}
