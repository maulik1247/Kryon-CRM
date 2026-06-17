import {
  ANNUAL_REVENUE_RANGES,
  formatLeadDate,
  isValidGstin,
  TIERS,
  VENDOR_STATUSES,
} from "./customer-constants";
import { DEFAULT_CURRENT_USER_ID } from "./default-users";
import { DEFAULT_MASTER_DATA } from "./default-master-data";
import type {
  AnnualRevenueRange,
  Customer,
  LeadSource,
  MasterDataLists,
  OemSegment,
  Priority,
  Tier,
  VendorStatus,
} from "./types";

export const CUSTOMER_EXCEL_HEADERS = [
  "Customer / Company Name",
  "OEM Segment",
  "Lead Source",
  "Lead Date",
  "Plant Location(s)",
  "Production Capacity (units/yr)",
  "Annual Revenue Range",
  "GSTIN",
  "Website URL",
  "Registered Office Address",
  "Factory / Plant Address",
  "Vendor Registration Status",
  "Registration Form Submitted Date",
  "Expected Approval Date",
  "Vendor Code",
  "Registration Documents",
  "Registration Remarks",
  "Priority",
  "Account Owner",
  "Customer Tier",
  "Estimated Annual Potential (INR)",
  "Notes",
] as const;

type XlsxModule = typeof import("xlsx");

function excelValueToString(value: unknown, xlsx?: XlsxModule): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().split("T")[0] ?? "";
  }
  if (typeof value === "number" && xlsx?.SSF.is_date(value)) {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${month}-${day}`;
    }
  }
  return String(value).trim();
}

function splitList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function customerToRow(customer: Customer): Record<string, string> {
  return {
    "Customer / Company Name": customer.name,
    "OEM Segment": customer.oemSegment,
    "Lead Source": customer.leadSource,
    "Lead Date": customer.leadDate,
    "Plant Location(s)": customer.plantLocations.join("; "),
    "Production Capacity (units/yr)": customer.productionCapacity,
    "Annual Revenue Range": customer.annualRevenueRange,
    GSTIN: customer.gstin,
    "Website URL": customer.websiteUrl,
    "Registered Office Address": customer.registeredOfficeAddress,
    "Factory / Plant Address": customer.factoryAddress,
    "Vendor Registration Status": customer.vendorStatus,
    "Registration Form Submitted Date": customer.registrationFormSubmittedDate,
    "Expected Approval Date": customer.expectedApprovalDate,
    "Vendor Code": customer.vendorCode,
    "Registration Documents": customer.registrationDocuments
      .map((doc) => doc.name)
      .join("; "),
    "Registration Remarks": customer.registrationRemarks,
    Priority: customer.priority,
    "Account Owner": customer.accountOwner,
    "Customer Tier": customer.tier,
    "Estimated Annual Potential (INR)": customer.estimatedAnnualPotential,
    Notes: customer.notes,
  };
}

function pickEnum<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function rowToCustomer(
  row: Record<string, unknown>,
  rowIndex: number,
  masterData: MasterDataLists,
  xlsx: XlsxModule
): { customer?: Customer; error?: string } {
  const cell = (value: unknown) => excelValueToString(value, xlsx);
  const name = cell(row["Customer / Company Name"]);
  if (!name) {
    return { error: `Row ${rowIndex}: Customer / Company Name is required.` };
  }

  const gstin = cell(row.GSTIN).toUpperCase();
  if (gstin && !isValidGstin(gstin)) {
    return { error: `Row ${rowIndex}: Invalid GSTIN for "${name}".` };
  }

  const vendorStatus = pickEnum<VendorStatus>(
    cell(row["Vendor Registration Status"]),
    VENDOR_STATUSES,
    "Not Started"
  );
  const vendorCode =
    vendorStatus === "Approved"
      ? cell(row["Vendor Code"])
      : "";

  const docNames = splitList(
    cell(row["Registration Documents"])
  );

  const customer: Customer = {
    id: `cust-import-${Date.now()}-${rowIndex}`,
    name,
    oemSegment: pickEnum<OemSegment>(
      cell(row["OEM Segment"]),
      masterData.oemSegments,
      masterData.oemSegments.includes("Other")
        ? "Other"
        : (masterData.oemSegments[0] ?? "Other")
    ),
    leadSource: pickEnum<LeadSource>(
      cell(row["Lead Source"]),
      masterData.leadSources,
      masterData.leadSources.includes("Other")
        ? "Other"
        : (masterData.leadSources[0] ?? "Other")
    ),
    leadDate:
      cell(row["Lead Date"]) || formatLeadDate(),
    plantLocations: splitList(
      cell(row["Plant Location(s)"])
    ),
    productionCapacity: cell(
      row["Production Capacity (units/yr)"]
    ),
    annualRevenueRange: pickEnum<AnnualRevenueRange>(
      cell(row["Annual Revenue Range"]),
      ANNUAL_REVENUE_RANGES,
      "< 100 Cr"
    ),
    gstin,
    websiteUrl: cell(row["Website URL"]),
    registeredOfficeAddress: cell(
      row["Registered Office Address"]
    ),
    factoryAddress: cell(row["Factory / Plant Address"]),
    vendorStatus,
    registrationFormSubmittedDate: cell(
      row["Registration Form Submitted Date"]
    ),
    expectedApprovalDate: cell(row["Expected Approval Date"]),
    vendorCode,
    registrationDocuments: docNames.map((docName, index) => ({
      id: `doc-import-${rowIndex}-${index}`,
      name: docName,
    })),
    registrationRemarks: cell(row["Registration Remarks"]),
    priority: pickEnum<Priority>(
      cell(row.Priority),
      ["A", "B", "C"],
      "B"
    ),
    accountOwner: pickEnum(
      cell(row["Account Owner"]),
      masterData.accountOwners,
      masterData.accountOwners[0] ?? ""
    ),
    tier: pickEnum<Tier>(
      cell(row["Customer Tier"]),
      TIERS,
      "Tier 2"
    ),
    estimatedAnnualPotential: cell(
      row["Estimated Annual Potential (INR)"]
    ),
    notes: cell(row.Notes),
    customerProducts: [],
    createdAt: new Date().toISOString(),
    createdByUserId: DEFAULT_CURRENT_USER_ID,
  };

  return { customer };
}

async function loadXlsx() {
  const XLSX = await import("xlsx");
  return XLSX;
}

export async function downloadCustomersExcel(customers: Customer[]): Promise<void> {
  const XLSX = await loadXlsx();
  const rows = customers.map(customerToRow);
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...CUSTOMER_EXCEL_HEADERS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Master");
  XLSX.writeFile(
    workbook,
    `kryon-customer-master-${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

export interface CustomerImportResult {
  customers: Customer[];
  errors: string[];
}

export async function parseCustomersExcelFile(
  file: File,
  masterData: MasterDataLists = DEFAULT_MASTER_DATA
): Promise<CustomerImportResult> {
  const XLSX = await loadXlsx();
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { customers: [], errors: ["The Excel file has no worksheets."] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: "",
  });

  if (rows.length === 0) {
    return { customers: [], errors: ["The Excel file has no data rows."] };
  }

  const customers: Customer[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const result = rowToCustomer(row, index + 2, masterData, XLSX);
    if (result.error) {
      errors.push(result.error);
      return;
    }
    if (result.customer) {
      customers.push(result.customer);
    }
  });

  return { customers, errors };
}
