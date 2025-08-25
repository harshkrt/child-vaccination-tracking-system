import { ROLES } from "../constants/index";
export interface User {
  _id: string;
  name: string;
  email: string;
  role: typeof ROLES[keyof typeof ROLES];
  createdAt?: string;
  updatedAt?: string;
}

export interface Child {
  _id: string;
  name: string;
  dob: string;
  gender: string; 
  parentId: string; 
  createdAt?: string;
  updatedAt?: string;
}

export interface Vaccine {
  _id: string;
  name: string;
  description?: string;
  doses: number;
  minAgeInMonths: number;
  maxAgeInMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Venue {
  _id: string;
  name: string;
  contact: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Region {
    _id: string;
    name: string;
    doctor: string | Pick<User, '_id' | 'name'>;
    venue: string | Pick<Venue, '_id' | 'name'>;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPendingSchedule {
  _id: string;
  child: Child;
  parent: Pick<User, '_id' | 'name' | 'email'>;
  doctor: Pick<User, '_id' | 'name' | 'email'>;
  venue: Pick<Venue, '_id' | 'name' | 'contact'>;
  region: Pick<Region, '_id' | 'name'>;
  vaccine: Vaccine;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  childAgeInMonthsAtVaccination: number | null;
  vaccineRecommendedMinAge: number;
  vaccineRecommendedMaxAge?: number;
}

export interface IParentVaccineOption extends Pick<Vaccine, '_id' | 'name' | 'doses'> {
  description?: string;
}

export type IParentRegionOption = Pick<Region, '_id' | 'name'>;


export interface IParentSchedule {
  _id: string;
  child: Pick<Child, '_id' | 'name' | 'dob'>;
  parent: Pick<User, '_id' | 'name'>;
  doctor: Pick<User, '_id' | 'name'>;
  venue: Pick<Venue, '_id' | 'name'>;
  region: Pick<Region, '_id' | 'name'>;
  vaccine: Pick<Vaccine, '_id' | 'name'>;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  updatedAt: string;
}

export interface IDoctorSchedule {
  _id: string;
  child: Pick<Child, '_id' | 'name' | 'dob' | 'gender'>;
  parent: Pick<User, '_id' | 'name' | 'email'>;
  vaccine: Vaccine;
  venue: Pick<Venue, '_id' | 'name' | 'contact'>;
  region: Pick<Region, '_id' | 'name'>;
  date: string;
  status: "pending_approval" | "scheduled" | "completed" | "missed" | "cancelled" | "rejected_by_admin";
  createdAt: string;
  updatedAt: string;
}

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

export type DoctorOption = Pick<User, '_id' | 'name'>;
export type VenueOption = Pick<Venue, '_id' | 'name'>;

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
export interface IAdminDashboardStats {
  pendingSchedules: number;
  totalUsers: number;
  totalDoctors: number;
  totalVaccines: number;
  totalRegions: number;
  totalVenues: number;
}

export interface IDoctorDashboardStats {
  todaysAppointments: number;
  completedThisWeek: number;
}

export interface IParentDashboardStats {
  childrenCount: number;
  upcomingVaccinations: number;
  pendingApproval?: number;
}