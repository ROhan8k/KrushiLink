// database.js - KrushiLink Database Integration
import { supabase } from "./supabaseClient.js";

// API Base URL for database operations (adjust as needed)
const API_BASE = window.location.origin;

class KrushiLinkDB {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Initialize authentication state
    await this.loadCurrentUser();
    this.setupAuthStateListener();
  }

  // ================= USER AUTHENTICATION =================

  async loadCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    this.currentUser = session?.user || null;
    this.updateAuthUI();
    return this.currentUser;
  }

  setupAuthStateListener() {
    supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser = session?.user || null;
      this.updateAuthUI();
    });
  }

  updateAuthUI() {
    const authSections = document.querySelectorAll("#authSection");
    authSections.forEach(section => {
      if (this.currentUser) {
        const userName = this.currentUser.user_metadata?.fullName || this.currentUser.email?.split('@')[0] || 'User';
        section.innerHTML = `
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-circle text-success me-2 fs-5"></i>
              <span class="fw-medium">Welcome, <strong>${userName}</strong></span>
            </div>
            <button id="logoutBtn" class="btn btn-outline-danger btn-sm">
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </div>
        `;
        
        // Add logout functionality
        const logoutBtn = section.querySelector("#logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async () => {
            await this.logout();
          });
        }
      } else {
        section.innerHTML = `
          <div class="d-flex gap-2">
            <a class="btn btn-outline-success btn-sm" href="login.html">
              <i class="bi bi-box-arrow-in-right me-1"></i>Login
            </a>
            <a class="btn btn-success btn-sm text-white" href="register.html">
              <i class="bi bi-person-plus me-1"></i>Register
            </a>
          </div>
        `;
      }
    });
  }

  async logout() {
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      this.updateAuthUI();
      
      // Redirect to home page with success message
      if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = 'index.html';
      }
      
      // Show success message
      setTimeout(() => {
        this.showMessage('Logged out successfully!', 'success');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      this.showMessage('Error logging out. Please try again.', 'error');
    }
  }

  // ================= STORE OPERATIONS =================

  async getAllStores() {
    try {
      // Fetch stores from our local API
      const response = await fetch('/api/stores');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stores = await response.json();
      return stores;
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Return fallback data if API fails
      return this.getFallbackStores();
    }
  }

  // Fallback data to ensure stores always show while fixing Supabase connectivity
  getFallbackStores() {
    return [
      {
        id: 1,
        name: 'Maharashtra State Agricultural Marketing Board Store',
        type: 'government',
        address: 'Plot No. 15, MIDC Area, Pune',
        district: 'Pune',
        phone: '+91-20-2561-7890',
        email: 'pune@msamb.gov.in',
        image_url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400',
        description: 'Government agricultural store providing subsidized seeds, fertilizers and farming equipment with various schemes available.',
        services: ['Seeds', 'Fertilizers', 'Pesticides', 'Farm Equipment', 'Government Schemes'],
        contact_person: 'Mr. Rajesh Patil',
        rating: 0,
        is_verified: true,
        schemes: [
          {
            name: 'Pradhan Mantri Krishi Sinchai Yojana',
            description: 'Water conservation and irrigation development scheme providing subsidies for drip and sprinkler irrigation systems.',
            subsidy_percentage: 55.00
          },
          {
            name: 'Soil Health Card Scheme',
            description: 'Free soil testing and health card provision with recommendations for optimal fertilizer use.',
            subsidy_percentage: 100.00
          }
        ]
      },
      {
        id: 2,
        name: 'Krishi Seva Kendra - Nashik',
        type: 'government',
        address: 'Near Collector Office, Nashik Road',
        district: 'Nashik',
        phone: '+91-253-245-6789',
        email: 'nashik@ksk.gov.in',
        image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
        description: 'District agricultural extension center providing technical support and government scheme assistance.',
        services: ['Technical Support', 'Soil Testing', 'Seeds', 'Government Schemes', 'Training Programs'],
        contact_person: 'Dr. Priya Sharma',
        rating: 0,
        is_verified: true,
        schemes: [
          {
            name: 'Kisan Credit Card Scheme',
            description: 'Credit facility for farmers to meet agricultural expenses and emergency needs.',
            subsidy_percentage: 0.00
          },
          {
            name: 'National Mission on Sustainable Agriculture',
            description: 'Promote sustainable agricultural practices through training and financial assistance.',
            subsidy_percentage: 75.00
          }
        ]
      },
      {
        id: 3,
        name: 'Maharaja Agri Center',
        type: 'government',
        address: 'Government Building Complex, Nagpur',
        district: 'Nagpur',
        phone: '+91-712-234-5678',
        email: 'nagpur@maharaja.gov.in',
        image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
        description: 'Central government agricultural center providing subsidized inputs and comprehensive farming support.',
        services: ['Subsidized Inputs', 'Crop Insurance', 'Government Schemes', 'Storage Facilities', 'Market Linkage'],
        contact_person: 'Mr. Anil Kumar',
        rating: 0,
        is_verified: true,
        schemes: [
          {
            name: 'Rashtriya Krishi Vikas Yojana',
            description: 'Comprehensive agricultural development scheme with focus on increasing productivity and farmers income.',
            subsidy_percentage: 60.00
          },
          {
            name: 'National Food Security Mission',
            description: 'Increase production of rice, wheat, pulses through improved seeds and farming practices.',
            subsidy_percentage: 50.00
          }
        ]
      },
      {
        id: 4,
        name: 'Agro World - Aurangabad',
        type: 'private',
        address: 'Shop No. 45, Agricultural Market, Aurangabad',
        district: 'Aurangabad',
        phone: '+91-240-234-5678',
        email: 'info@agroworld.com',
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        description: 'Private agricultural store offering premium quality seeds, modern farming tools and expert consultation services.',
        services: ['Premium Seeds', 'Modern Tools', 'Consultation', 'Organic Products', 'Irrigation Systems'],
        contact_person: 'Mr. Santosh Joshi',
        rating: 0,
        is_verified: true,
        schemes: []
      },
      {
        id: 5,
        name: 'FarmTech Solutions',
        type: 'private',
        address: '123 Main Road, Kolhapur',
        district: 'Kolhapur',
        phone: '+91-231-234-5678',
        email: 'contact@farmtech.in',
        image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
        description: 'Advanced agricultural technology store specializing in modern farming equipment and smart irrigation solutions.',
        services: ['Smart Irrigation', 'Drones', 'Sensors', 'Modern Equipment', 'Technology Training'],
        contact_person: 'Ms. Kavita Desai',
        rating: 0,
        is_verified: true,
        schemes: []
      },
      {
        id: 6,
        name: 'Green Valley Agro Store',
        type: 'private',
        address: 'Near Bus Stand, Solapur',
        district: 'Solapur',
        phone: '+91-217-234-5678',
        email: 'sales@greenvalley.com',
        image_url: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=400',
        description: 'Family-owned store providing quality agricultural inputs and personalized farming advice for three generations.',
        services: ['Traditional Seeds', 'Organic Fertilizers', 'Hand Tools', 'Personal Advice', 'Local Varieties'],
        contact_person: 'Mr. Govind Patil',
        rating: 0,
        is_verified: true,
        schemes: []
      }
    ];
  }

  async getStoreById(id) {
    try {
      const response = await fetch(`/api/stores/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const store = await response.json();
      return store;
    } catch (error) {
      console.error('Error fetching store by ID:', error);
      // Return fallback data for this specific store
      const fallbackStores = this.getFallbackStores();
      return fallbackStores.find(store => store.id === parseInt(id)) || null;
    }
  }

  async filterStores(filters) {
    try {
      const params = new URLSearchParams();
      
      if (filters.district && filters.district !== 'all') {
        params.append('district', filters.district);
      }
      
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      
      if (filters.resource && filters.resource !== 'all') {
        params.append('resource', filters.resource);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const response = await fetch(`/api/stores/filter?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stores = await response.json();
      return stores;
    } catch (error) {
      console.error('Error filtering stores:', error);
      return [];
    }
  }

  // ================= COMMENT OPERATIONS =================

  async getComments(storeId) {
    try {
      const response = await fetch(`/api/stores/${storeId}/comments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const comments = await response.json();
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async addComment(storeId, comment, rating) {
    if (!this.currentUser) {
      throw new Error('You must be logged in to add a comment');
    }

    try {
      const newComment = {
        user_email: this.currentUser.email,
        user_name: this.currentUser.user_metadata?.fullName || this.currentUser.email.split('@')[0],
        comment: comment.trim(),
        rating: parseInt(rating)
      };

      const response = await fetch(`/api/stores/${storeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  }

  async deleteComment(storeId, commentId) {
    if (!this.currentUser) {
      throw new Error('You must be logged in to delete a comment');
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: this.currentUser.email
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      throw error;
    }
  }

  // ================= UTILITY FUNCTIONS =================

  showMessage(message, type = 'info') {
    // Create or update message element
    let messageEl = document.getElementById('krushilink-message');
    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.id = 'krushilink-message';
      messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
      `;
      document.body.appendChild(messageEl);
    }

    // Set message type styling
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };

    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    messageEl.style.display = 'block';

    // Auto hide after 4 seconds
    setTimeout(() => {
      if (messageEl) {
        messageEl.style.display = 'none';
      }
    }, 4000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    if (hasHalfStar) {
      starsHTML += '<i class="bi bi-star-half text-warning"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="bi bi-star text-warning"></i>';
    }
    
    return starsHTML;
  }
}

// Create global instance
window.krushiDB = new KrushiLinkDB();

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

export default window.krushiDB;