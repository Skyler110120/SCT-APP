import { Platform } from 'react-native';
import { apiFetch } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InstructorStudentsResponse } from '@/src/types/auth.types';

export const instructorService = {
    /**
     * Get all students assigned to a specific instructor
     * @returns Promise with a list of students or an error message
     */
    async getMyStudents(): Promise<InstructorStudentsResponse> {
        try {
            console.log("Fetching instructor students...");

            const students = await apiFetch(`/instructors/students`);

            console.log("Raw API Response:", students);
            console.log("First student raw data:", students[0]);
            return {
                success: true,
                data: students,
            }
        } catch (error) {
            console.error("Error fetching instructor students:", error);
            return {
                success: false,
                error: "Network error. Please check your connection and try again later."
            }
        }
    }
}