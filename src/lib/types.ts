export interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string; // For login
    allowedProvinces?: string[]; // Allowed Governorates
    allowedBrands?: string[]; // Allowed Brands IDs
    role: 'admin' | 'sales_rep' | 'data_entry';
    status: 'active' | 'inactive';
    avatar?: string;
}

export interface Client {
    id: string;
    name: string;
    status: 'new' | 'qualifying' | 'proposal' | 'won' | 'lost';
    phone: string;
    productInterest: string;
    lastInteraction: string;
    email: string;
    address: string;
    province?: string; // Governorate
    instagram?: string;
    googleMapsUrl?: string;
    category?: string; // e.g., 'Restaurant', 'Cafe', 'Hotel'
    notes?: string;
    assignedTo?: string; // Team member ID
    followUpDate?: string; // Next follow-up date
    followUpNote?: string; // Follow-up reminder note
    dealValue?: number; // Snapshot of deal value at time of sale
    lossReason?: 'price' | 'competitor' | 'timing' | 'features' | 'other'; // Reason for lost deal
    lossNote?: string; // Additional details for loss
}

export interface Activity {
    id: string;
    clientId: string;
    type: 'call' | 'visit' | 'note' | 'email' | 'assignment' | 'reminder';
    description: string;
    timestamp: string;
    user: string;
}

export interface Brand {
    id: string;
    name: string;
    description?: string;
}

export interface Product {
    id: string;
    brandId: string; // Link to Brand
    name: string;
    description: string;
    price: number;
    currency: string; // e.g., 'USD', 'IQD'
    period?: string; // e.g., 'month', 'year', 'once'
    features: string[];
    isPopular?: boolean;
}

export interface Subscription {
    id: string;
    clientId: string;
    productId: string;
    productName: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'pending';
    amount?: number; // Added for order value
}

// Monthly targets for sales reps
export interface MonthlyTarget {
    id: string;
    memberId: string; // Team member ID
    month: number; // 1-12
    year: number; // e.g., 2024
    dealsTarget: number; // Won deals target
    visitsTarget: number; // Client visits target
    createdAt: string;
    updatedAt: string;
}
