import { themes } from "@/src/context/themes";
import { companyListStyles as styles } from "@/src/styles/DashboardPageStyles/MasterAdminDashboardStyles/companyListStyles";
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
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Companies</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={themes.vegasGold} />
      ) : (
        <ScrollView style={styles.listContainer}>
          {companies.length > 0 ? (
            companies.map((company) => (
              <TouchableOpacity
                key={company.id}
                style={[
                  styles.companyCard,
                  selectedCompany?.id === company.id &&
                    styles.selectedCompanyCard,
                ]}
                onPress={() => onSelectCompany(company)}
              >
                <Text style={styles.companyText}>{company.name}</Text>
                {company.website && (
                  <Text
                    style={[
                      styles.companyText,
                      { fontSize: 14, opacity: 0.7 },
                    ]}
                  >
                    {company.website}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyListText}>No companies found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CompanyList;