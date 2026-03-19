export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'user' | 'homeowner' | 'admin';
  avatar?: string;
  verificationLevel: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    area: string;
    city: string;
  };
  images: { url: string; isPrimary: boolean }[];
  status: string;
}

// Add more types as needed
