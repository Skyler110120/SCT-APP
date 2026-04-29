import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  InviteCode,
  CreateInviteCodeRequest,
  CompanyResponse,
  CompanyListResponse,
  InviteCodeResponse,
  InviteCodeListResponse,
} from "../types/company.types";

export const companyService = {
  /**
   * Get a company by ID
   * @param companyID - ID of the company to fetch
   * @returns company data or error message
   */
  async getCompany(companyID: number): Promise<CompanyResponse> {
    try {

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

      const data: Company = await apiFetch<Company>(`/companies`, {
        method: "POST",
        body: JSON.stringify(companyData),
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
   * Update an existing company
   * @param companyID - ID of the company to update
   * @param companyData - partial company payload
   * @returns updated company data or error message
   */
  async updateCompany(
    companyID: number,
    companyData: UpdateCompanyRequest
  ): Promise<CompanyResponse> {
    try {
      const data: Company = await apiFetch<Company>(`/companies/${companyID}`, {
        method: "PATCH",
        body: JSON.stringify(companyData),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error updating company:", error);
      return {
        success: false,
        error: "An error occurred while updating the company",
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
  /**
   * Get a signed onboarding link for the company (TASK-ONB-001).
   * Returns a token, join URL, and company info.
   */
  async getOnboardingLink(
    companyId: number,
    courseId?: number
  ): Promise<{
    success: boolean;
    data?: {
      token: string;
      join_url: string;
      company_id: number;
      company_name: string;
      course_id?: number;
      expires_in_days: number;
    };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (courseId) params.set("course_id", courseId.toString());
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch(`/companies/${companyId}/onboarding-link${qs}`);
      return { success: true, data };
    } catch (error: any) {
      console.error("Error getting onboarding link:", error);
      return {
        success: false,
        error: error?.detail || "Failed to generate onboarding link",
      };
    }
  },

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
        `/companies/${inviteData.company_id}/invite-codes/${inviteData.role}`,
        {
          method: "POST",
          body: JSON.stringify({}),
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
