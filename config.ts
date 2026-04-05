const rawBase = import.meta.env.VITE_API_BASE_URL || '';

export const CONFIG = {
  apiBaseUrl: rawBase.replace(/\/+$/, ''), // hapus trailing slash
};

export const API = {
  DETAILUSER: () => `${CONFIG.apiBaseUrl}/api/User/`,
  LOGINUSER: () => `${CONFIG.apiBaseUrl}/api/User/Login`,
  FILTERS: () => `${CONFIG.apiBaseUrl}/api/Filter/`,
  STDQUANTITY: () => `${CONFIG.apiBaseUrl}/api/StdQuantity`,
  GENERALSETTING: () => `${CONFIG.apiBaseUrl}/api/GeneralSetting`,
  REGISTERTOOLS: () => `${CONFIG.apiBaseUrl}/api/RegisterTools`,
  TYPETOOLS: () => `${CONFIG.apiBaseUrl}/api/ToolType`,
  BOOKING: () => `${CONFIG.apiBaseUrl}/api/Booking`,
  RENTTOOLS: () => `${CONFIG.apiBaseUrl}/api/RentTools`,
  RETURNTOOLS: () => `${CONFIG.apiBaseUrl}/api/RentTools/Return`,
  ACTIVATIONTOOLS: () => `${CONFIG.apiBaseUrl}/api/ActivationTools`,
  ACTIVATIONTOOLSDETAIL: () => `${CONFIG.apiBaseUrl}/api/ActivationTools/Detail`,
  BAKT: () => `${CONFIG.apiBaseUrl}/api/Bakt`,
  AUDITTOOLS: () => `${CONFIG.apiBaseUrl}/api/AuditTools`,
  CERTIFICATION: () => `${CONFIG.apiBaseUrl}/api/Certification`,

};