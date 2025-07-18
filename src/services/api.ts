const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://manage.sandeshservice.com/api'
    : 'http://localhost:3001/api');

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async adminLogin(email: string, password: string) {
    const response = await this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  }

  async deliveryBoyLogin(username: string, password: string) {
    const response = await this.request('/auth/delivery-boy/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Admin endpoints
  async getRestaurants() {
    return this.request('/admin/restaurants');
  }

  async createRestaurant(data: { name: string; status: string }) {
    return this.request('/admin/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: string, data: { name: string; status: string }) {
    return this.request(`/admin/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: string) {
    return this.request(`/admin/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async getAddresses() {
    return this.request('/admin/addresses');
  }

  async createAddress(data: { address_name: string; delivery_charge: number }) {
    return this.request('/admin/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: { address_name: string; delivery_charge: number }) {
    return this.request(`/admin/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request(`/admin/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async getDeliveryBoys() {
    return this.request('/admin/delivery-boys');
  }

  async createDeliveryBoy(data: { name: string; username: string; password: string; status: string }) {
    return this.request('/admin/delivery-boys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDeliveryBoy(id: string, data: { name: string; username: string; password?: string; status: string }) {
    return this.request(`/admin/delivery-boys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDeliveryBoy(id: string) {
    return this.request(`/admin/delivery-boys/${id}`, {
      method: 'DELETE',
    });
  }

  async getDeliveries(filters?: { startDate?: string; endDate?: string; deliveryBoy?: string; restaurant?: string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.deliveryBoy) params.append('deliveryBoy', filters.deliveryBoy);
    if (filters?.restaurant) params.append('restaurant', filters.restaurant);
    
    const queryString = params.toString();
    return this.request(`/admin/deliveries${queryString ? `?${queryString}` : ''}`);
  }

  // Delivery boy endpoints
  async getActiveRestaurants() {
    return this.request('/delivery/restaurants');
  }

  async getAllAddresses() {
    return this.request('/delivery/addresses');
  }

  async getAddressById(id: string) {
    return this.request(`/delivery/addresses/${id}`);
  }

  async submitDelivery(data: { restaurant_id: string; address_id: string; food_cost: number }) {
    return this.request('/delivery/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyDeliveries() {
    return this.request('/delivery/my-deliveries');
  }

  async getMyStats() {
    return this.request('/delivery/stats');
  }
}

export const apiService = new ApiService();
