import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Company,
  CreateCompanyRequest,
  InviteCode,
  CreateInviteCodeRequest,
  CompanyResponse,
  CompanyListResponse,
  InviteCodeResponse,
  InviteCodeListResponse,
} from "../types/company.types";

let API_URL: string;

if (__DEV__) {
  if (Platform.OS === "android") {
    API_URL = "http://10.0.2.2:8000";
  } else {
    API_URL = "http://localhost:8000";
  }
} 
export const companyService = {
  /**
   * Get a company by ID
   * @param companyID - ID of the company to fetch
   * @returns company data or error message
   */
  async getCompany(companyID: number): Promise<CompanyResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
      }
    }

    const response = await fetch(`${API_URL}/companies/${companyID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch company:", errorData);
      return {
        success: false,
        error: errorData.detail || "Failed to fetch company",
      };
    }

    const data: Company = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching company:", error);
    return {
      success: false,
      error: "An error occurred while fetching the company",
    };
  }
},
  /**
   * Get all companies
   * @returns list of companies or error message
   */
  async getAllCompanies(): Promise<CompanyListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/companies`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch companies:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch companies",
        };
      }
      const data: Company[] = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching companies:", error);
      return {
        success: false,
        error: "An error occurred while fetching companies",
      };
    }
  },
  /**
   * Create a new company
   * @param companyData - data for the new company
   * @returns new company data or error message
   */
  async createCompany(
    companyData: CreateCompanyRequest
  ): Promise<CompanyResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create company:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create company",
        };
      }

      const data: Company = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error creating company:", error);
      return {
        success: false,
        error: "An error occurred while creating the company",
      };
    }
  },

  /**
   * Get all invite codes for a company
   * @param companyID - ID of the company
   * @returns list of invite codes or error message
   */
  async getInviteCodes(companyID: number): Promise<InviteCodeListResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/companies/${companyID}/invite-codes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch invite codes:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to fetch invite codes",
        };
      }

      const data: InviteCode[] = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching invite codes:", error);
      return {
        success: false,
        error: "An error occurred while fetching invite codes",
      };
    }
  },

  /**
   * Create a new invite code for a company
   * @param inviteData - data for the new invite code
   * @returns new invte code or error message
   */
  async createInviteCode(
    inviteData: CreateInviteCodeRequest
  ): Promise<InviteCodeResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        return {
          success: false,
          error: "No authentication token found",
        };
      }

      const response = await fetch(
        `${API_URL}/companies/${inviteData.company_id}/invite-codes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create invite code:", errorData);
        return {
          success: false,
          error: errorData.detail || "Failed to create invite code",
        };
      }

      const data: InviteCode = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error creating ivite code:", error);
      return {
        success: false,
        error: "An error occurred while creating the invite code",
      };
    }
  },
};
