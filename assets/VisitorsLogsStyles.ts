import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingLeft: 16,
  },
  searchButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    left: 250
  },
  dateText: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '500',
  },

  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#003566',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTabButton: {
    backgroundColor: '#003566',
  },
  tabButtonText: {
    fontWeight: '500',
    color: '#000000',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontWeight: '500',
    color: '#555',
  },
  nameColumn: {
    flex: 3,
  },
  timeColumn: {
    flex: 4,
    textAlign: 'center',
  },
  actionColumn: {
    flex: 2,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 80,
  },
  visitorRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    alignItems: 'center',
  },
  visitorInfo: {
    flex: 3,
  },
  visitorName: {
    fontWeight: '500',
    fontSize: 15,
  },
  timeInfo: {
    flex: 4,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    textAlign: 'center',
  },
  timeInText: {
    color: '#4CD964', 
  },
  timeOutText: {
    color: '#FF3B30', 
  },
  actionContainer: {
    flex: 2,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#003566',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  timeOutButton: {
    backgroundColor: '#D9534F',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#252525',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },

  // Date Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedPickerItem: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#1890ff',
  },
  pickerText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Visitor Details Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxHeight: '80%',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 2,
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  visitorDetailsContainer: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  universityInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  universityName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  visitorDetailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  visitorDetailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 11,
  },
  visitorId: {
    fontSize: 14,
    color: '#252525',
    textAlign: 'center',
  },
  detailsContent: {
    width: '100%',
  },
  detailsSection: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  detailsLabel: {
    flex: 1.5,
    fontSize: 14,
    color: '#555',
  },
  detailsValue: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  visitCountContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitCountValue: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  viewLogLink: {
    color: '#4682B4',
    textDecorationLine: 'underline',
  },
  timeSection: {
    width: '100%',
    marginTop: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  timeLabel: {
    fontSize: 14,
    color: '#555',
  },
  timeInValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CD964',
  },
  timeOutValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },

  // Time Out button in modal
  timeOutModalButton: {
    backgroundColor: '#D9534F',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  timeOutModalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  // Additional styles for better UI
  badgeContainer: {
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#E1F5FE',
  },
  activeBadgeText: {
    color: '#0288D1',
    fontSize: 12,
  },
  expiredBadge: {
    backgroundColor: '#FFEBEE',
  },
  expiredBadgeText: {
    color: '#D32F2F',
    fontSize: 12,
  }
  
});

export default styles;