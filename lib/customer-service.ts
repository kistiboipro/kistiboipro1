export type CustomerType = 'Installment' | 'Cash' | 'Cash-remaining';

export interface Guarantor {
  name: string;
  mobile: string;
  details: string;
  photoAdded?: boolean;
}

export interface CustomerRecord {
  id: string | number;
  name: string;
  type: CustomerType;
  primaryMobile?: string;
  secondMobile?: string;
  workplace?: string;
  workAddress?: string;
  address?: string;
  familyMemberName?: string;
  familyMemberMobile?: string;
  landlordName?: string;
  landlordMobile?: string;
  guarantors: Guarantor[];
  hasNid?: boolean;
  status: 'Completed' | 'Active' | 'No cell';
  avatarBg?: string;
  createdAt?: string;
}

export function validateCustomer(
  type: CustomerType,
  data: { name: string; primaryMobile?: string }
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = "Customer's full name is required";
  }

  if (type === 'Installment' || type === 'Cash-remaining') {
    if (!data.primaryMobile || data.primaryMobile.trim().length === 0) {
      errors.primaryMobile = 'Primary mobile number is required';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterCustomerList(
  customers: CustomerRecord[],
  searchQuery = '',
  typeFilter = 'all',
  statusFilter = 'all',
  dateRange: { start: string; end: string } | null = null
): CustomerRecord[] {
  const query = searchQuery.trim().toLowerCase();

  return customers.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query) ||
      (c.primaryMobile && c.primaryMobile.includes(query)) ||
      (c.address && c.address.toLowerCase().includes(query));

    const matchesType =
      typeFilter === 'all' ||
      c.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' ||
      c.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateRange && c.createdAt) {
      matchesDate = c.createdAt >= dateRange.start && c.createdAt <= dateRange.end;
    }

    return matchesQuery && matchesType && matchesStatus && matchesDate;
  });
}
