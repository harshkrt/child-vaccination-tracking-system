export const API_URL = import.meta.env.VITE_API_BASE_URL;

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PARENT: 'parent',
};

export const VACCINATION_STATUSES = {
  PENDING_APPROVAL: 'pending_approval',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  MISSED: 'missed',
  CANCELLED: 'cancelled',
  REJECTED_BY_ADMIN: 'rejected_by_admin'
};

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
}