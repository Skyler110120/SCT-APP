import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
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
import { InviteCodeValidationRequest } from "../types/onboarding.types";

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

    const data: Company = await apiFetch<Company>(`/companies/${companyID}`)
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
       
      const data: Company[] = await apiFetch<Company[]>("/companies");
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

      const data: Company = await apiFetch<Company>(`/companies`, {
        method: "POST",
        body: JSON.stringify(companyData),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      
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

      const data: InviteCode[] = await apiFetch<InviteCode[]>(`/companies/${companyID}/invite-codes`);
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

      const data: InviteCode = await apiFetch<InviteCode>(
        `/companies/${inviteData.company_id}/invite-codes`,
        {
          method: "POST",
          body: JSON.stringify({}),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
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
