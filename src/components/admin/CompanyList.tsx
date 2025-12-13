import { themes } from "@/src/context/themes";
import { masterAdminDashboardStyles as companyList } from "@/src/styles/DashboardPageStyles/masterDashboardScreen";
import { Company } from "@/src/types/company.types";
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CompanyListProps {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  onSelectCompany: (company: Company) => void;
}

const CompanyList = ({
  companies,
  selectedCompany,
  isLoading,
  onSelectCompany,
}: CompanyListProps) => {
  return (
    <View style={companyList.sectionContainer}>
      <Text style={companyList.sectionTitle}>Companies</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={themes.vegasGold} />
      ) : (
        <ScrollView style={companyList.listContainer}>
          {companies.length > 0 ? (
            companies.map((company) => (
              <TouchableOpacity
                key={company.id}
                style={[
                  companyList.companyCard,
                  selectedCompany?.id === company.id &&
                    companyList.selectedCompanyCard,
                ]}
                onPress={() => onSelectCompany(company)}
              >
                <Text style={companyList.companyText}>{company.name}</Text>
                {company.website && (
                  <Text
                    style={[
                      companyList.companyText,
                      { fontSize: 14, opacity: 0.7 },
                    ]}
                  >
                    {company.website}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={companyList.emptyListText}>No companies found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CompanyList;