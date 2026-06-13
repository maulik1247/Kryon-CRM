export type PipelineStage = string;

export type StageKind = "open" | "won" | "lost";

export interface PipelineStageConfig {
  id: string;
  name: string;
  color: string;
  kind: StageKind;
}

export type ConfidenceLevel = 100 | 75 | 50 | 25 | 0;

export type Priority = "A" | "B" | "C";

export type Tier = "Tier 1" | "Tier 2" | "Tier 3";

export type VendorStatus =
  | "Not Started"
  | "In Process"
  | "Approved"
  | "Rejected";

export type OemSegment = string;

export type LeadSource = string;

export type AnnualRevenueRange =
  | "< 100 Cr"
  | "100-500 Cr"
  | "500-1000 Cr"
  | "1000-5000 Cr"
  | "> 5000 Cr";

export interface RegistrationDocument {
  id: string;
  name: string;
  size?: number;
}

export type ProductType = string;

export type MotorControllerType =
  | "BLDC Indoor"
  | "BLDC Outdoor"
  | "PSC Motor"
  | "Universal Motor"
  | "Direct Drive"
  | "Stepper Motor"
  | "PMSM"
  | "Other";

export type MotorPoleCount = 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | "Other";

export type SensorType =
  | "Hall Sensor (3-wire)"
  | "Sensorless (Back-EMF)"
  | "Encoder (Optical)"
  | "Encoder (Magnetic)"
  | "Resolver"
  | "Other";

export interface ProductSpecDocument {
  id: string;
  name: string;
  size?: number;
}

export interface CustomerProductSupplier {
  name: string;
  volume: string;
  purchasePrice: number;
}

export interface CustomerProductDetails {
  id: string;
  productSkuOrModel: string;
  annualQuantityPcs?: number;
  monthlyOfftakePcs?: number;
  currentPurchasePrice: number;
  voltage: number;
  wattage: number;
  poles: MotorPoleCount;
  primarySupplier: CustomerProductSupplier;
  secondarySupplier?: CustomerProductSupplier;
}

export type UserRole = "admin" | "sales";

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type MasterDataListKey =
  | "oemSegments"
  | "leadSources"
  | "accountOwners"
  | "productTypes";

export interface MasterDataLists {
  oemSegments: string[];
  leadSources: string[];
  accountOwners: string[];
  productTypes: string[];
}

export type BuyingRole =
  | "Decision Maker"
  | "Influencer"
  | "Gatekeeper"
  | "User"
  | "Champion";

export type ContactDepartment =
  | "R&D"
  | "Purchase"
  | "Vendor Development"
  | "Quality"
  | "Management"
  | "Operations"
  | "Finance"
  | "Other";

export interface Product {
  id: string;
  sku: string;
  model: string;
  motorControllerType: MotorControllerType;
  voltage: number;
  wattage: number;
  poles: MotorPoleCount;
  sensorType: SensorType;
  hsnCode: string;
  sellingPrice: number;
  description?: string;
  specSheet?: ProductSpecDocument;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  designation: string;
  department: ContactDepartment;
  phone: string;
  email: string;
  officePhone?: string;
  buyingRole: BuyingRole;
  reportsTo?: string;
  isPrimary: boolean;
  linkedInUrl?: string;
  birthdayOrAnniversary?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  oemSegment: OemSegment;
  leadSource: LeadSource;
  leadDate: string;
  plantLocations: string[];
  productionCapacity: string;
  annualRevenueRange: AnnualRevenueRange | "";
  gstin: string;
  websiteUrl: string;
  registeredOfficeAddress: string;
  factoryAddress: string;
  vendorStatus: VendorStatus;
  registrationFormSubmittedDate: string;
  expectedApprovalDate: string;
  vendorCode: string;
  registrationDocuments: RegistrationDocument[];
  registrationRemarks: string;
  priority: Priority;
  accountOwner: string;
  tier: Tier;
  estimatedAnnualPotential: string;
  notes: string;
  customerProducts: CustomerProductDetails[];
}

export interface Deal {
  id: string;
  customerId: string;
  contactId: string;
  productId: string;
  quantity: number;
  estimatedAnnualValue: number;
  currentSupplierPrice: number;
  quotedPrice: number;
  confidence: ConfidenceLevel;
  stage: PipelineStage;
  stageEnteredAt: string;
  lastActivityAt: string;
  owner: string;
}

export type DealActivityType = "call" | "meeting" | "email" | "visit" | "note";

export interface DealActivity {
  id: string;
  dealId: string;
  type: DealActivityType;
  occurredAt: string;
  contactId?: string;
  summary: string;
  outcome?: string;
  loggedByUserId: string;
  assignedToUserId?: string;
  createdAt: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface DealTask {
  id: string;
  dealId: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  createdByUserId: string;
  assignedToUserId: string;
}

export type CrmReminderKind =
  | "task_assigned"
  | "visit_assigned"
  | "meeting_assigned";

export interface CrmReminder {
  id: string;
  userId: string;
  kind: CrmReminderKind;
  title: string;
  message: string;
  dueDate?: string;
  dealId: string;
  taskId?: string;
  activityId?: string;
  createdAt: string;
  readAt?: string;
}

export interface DueThisWeekTask {
  id: string;
  dealId: string;
  title: string;
  dueDate: string;
  customerName: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInAt?: string;
  checkOutAt?: string;
}
