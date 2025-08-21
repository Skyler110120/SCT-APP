import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InstructorStudentsResponse } from '@/src/types/auth.types';

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
} else {
  API_URL = "https://your-production-api.com";
}

export const instructorService = {
    /**
     * Get all students assigned to a specific instructor
     * @returns Promise with a list of students or an error message
     */
    async getMyStudents(): Promise<InstructorStudentsResponse> {
        try {
            const token = await AsyncStorage.getItem("auth_token");

            if (!token) {
                return {
                    success: false,
                    error: "Authentication token not found. Please log in again."
                };
            }

            console.log("Fetching instructor students...");

            const response = await fetch(`${API_URL}/instructors/students`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                }
            })

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to fetch instructor's students:", errorData);

                if (response.status === 403) {
                    return {
                        success: false,
                        error: "Only instructors can access student information"
                    };
                }

                if (response.status === 401) {
                    return {
                        success: false,
                        error: "Authentication expired. Please log in again."
                    };
                }

                
                return {
                    success: false,
                    error: errorData.detail || "Failed to fetch students"
                };
            }

            const students = await response.json();

            console.log("📡 Raw API Response:", students);
      console.log("📡 First student raw data:", students[0]);
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