export interface Restaurant {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  address_name: string;
  delivery_charge: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryBoy {
  _id: string;
  name: string;
  username: string;
  password: string;
  status: 'active' | 'inactive';
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Delivery {
  _id: string;
  delivery_boy_id: string | DeliveryBoy;
  restaurant_id: string | Restaurant;
  address_id: string | Address;
  delivery_charge: number;
  food_cost: number;
  total: number;
  date_time: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  email?: string;
  username: string;
  name?: string;
  role: 'admin' | 'delivery-boy';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  deliveryBoy?: string;
  restaurant?: string;
}