import { StyleSheet } from 'react-native';
import { themes } from '@/src/context/themes';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.vegasGold,
    flexDirection: 'column',
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themes.vegasGold,
    fontFamily: 'Chakra-Bold',
  },
  userInfoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themes.white,
    marginBottom: 5,
    fontFamily: 'Chakra-Bold',
  },
  emailText: {
    fontSize: 16,
    color: '#cccccc',
    fontFamily: 'Chakra-Regular',
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    fontFamily: 'Chakra-Regular',
  },
  logoutButton: {
    backgroundColor: themes.black || '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: themes.vegasGold || '#000033',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Chakra-Bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: themes.vegasGold,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: themes.white,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
   
    textAlign: "center",
    marginBottom: 20,
    color: themes.white,
  },
});