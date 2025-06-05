// src/types/index.ts
import { ROLES } from "../constants/index"; // Corrected path alias

// Base User Interface (as might be returned by /auth/profile or populated in other types)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: typeof ROLES[keyof typeof ROLES]; // 'parent', 'doctor', 'admin'
  createdAt?: string;
  updatedAt?: string;
}

// Base Child Interface
export interface Child {
  _id: string;
  name: string;
  dob: string; // Date string, e.g., "YYYY-MM-DD"
  gender: string; // "male", "female", "other"
  parentId: string; // Refers to User _id
  createdAt?: string;
  updatedAt?: string;
}

// Base Vaccine Interface
export interface Vaccine {
  _id: string;
  name: string;
  description?: string;
  doses: number;
  minAgeInMonths: number;
  maxAgeInMonths?: number; // Optional
  createdAt?: string;
  updatedAt?: string;
}

// Base Venue Interface
export interface Venue {
  _id: string;
  name: string;
  contact: string; // e.g., address or phone number
  createdAt?: string;
  updatedAt?: string;
}
// Base Region Interface
export interface Region {
    _id: string;
    name: string;
    doctor: string | Pick<User, '_id' | 'name'>; // Can be an ID string or a populated doctor object part
    venue: string | Pick<Venue, '_id' | 'name'>;    // Can be an ID string or a populated venue object part
    createdAt?: string;
    updatedAt?: string;
}


// --- Types specific to component/page data structures ---

// For Admin's view of a schedule pending approval (highly populated)
export interface IPendingSchedule {
  _id: string;
  child: Child; // Populated: name, dob, gender
  parent: Pick<User, '_id' | 'name' | 'email'>;
  doctor: Pick<User, '_id' | 'name' | 'email'>;
  venue: Pick<Venue, '_id' | 'name' | 'contact'>;
  region: Pick<Region, '_id' | 'name'>;
  vaccine: Vaccine; // Populated: name, min/max age, doses etc.
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  childAgeInMonthsAtVaccination: number | null;
  vaccineRecommendedMinAge: number;
  vaccineRecommendedMaxAge?: number;
}

// For Parent's view when selecting a vaccine (simplified vaccine info)
export interface IParentVaccineOption extends Pick<Vaccine, '_id' | 'name' | 'doses'> {
  description?: string; // Parent might see description too
}

// For Parent's view when selecting a region (simplified region info)
export type IParentRegionOption = Pick<Region, '_id' | 'name'>;


// For Parent's view of their vaccination schedules (populated with essential names)
export interface IParentSchedule {
  _id: string;
  child: Pick<Child, '_id' | 'name' | 'dob'>;
  parent: Pick<User, '_id' | 'name'>; // Though parent is the viewer, API might return it
  doctor: Pick<User, '_id' | 'name'>;
  venue: Pick<Venue, '_id' | 'name'>;
  region: Pick<Region, '_id' | 'name'>;
  vaccine: Pick<Vaccine, '_id' | 'name'>;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  updatedAt: string;
}

// For Doctor's view of their vaccination schedules (populated)
export interface IDoctorSchedule {
  _id: string;
  child: Pick<Child, '_id' | 'name' | 'dob' | 'gender'>;
  parent: Pick<User, '_id' | 'name' | 'email'>;
  vaccine: Vaccine; // Doctor might need full vaccine details
  venue: Pick<Venue, '_id' | 'name' | 'contact'>;
  region: Pick<Region, '_id' | 'name'>;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  updatedAt: string;
}

// For Admin's view of regions (might have doctor/venue as IDs or populated objects)
export type PopulatedDoctorForRegion = Pick<User, '_id' | 'name'>;
export type PopulatedVenueForRegion = Pick<Venue, '_id' | 'name'>;

export interface IRegionAdminView {
  _id: string;
  name: string;
  doctor: string | PopulatedDoctorForRegion;
  venue: string | PopulatedVenueForRegion;
  createdAt?: string;
  updatedAt?: string;
}

// For Admin's select dropdown options
export type DoctorOption = Pick<User, '_id' | 'name'>;
export type VenueOption = Pick<Venue, '_id' | 'name'>;

// For Admin's full view of any schedule (e.g., in manage/delete schedules page)
export interface IAdminFullScheduleView {
  _id: string;
  child: Pick<Child, '_id' | 'name' | 'dob'>;
  parent: Pick<User, '_id' | 'name' | 'email'>;
  doctor: Pick<User, '_id' | 'name'>;
  venue: Pick<Venue, '_id' | 'name'>;
  region: Pick<Region, '_id' | 'name'>;
  vaccine: Pick<Vaccine, '_id' | 'name'>;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt?: string;
  updatedAt?: string;
}
// For Admin's dashboard stats
export interface IAdminDashboardStats {
  pendingSchedules: number;
  totalUsers: number;
  totalDoctors: number;
  totalVaccines: number;
  totalRegions: number;
  totalVenues: number;
}

// In src/types/index.ts
export interface IDoctorDashboardStats {
  todaysAppointments: number;
  completedThisWeek: number;
}

export interface IParentDashboardStats {
  childrenCount: number;
  upcomingVaccinations: number;
  pendingApproval?: number;
}