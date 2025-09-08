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
      // Fetch stores from Supabase with their related schemes
      const { data: stores, error } = await supabase
        .from('stores')
        .select(`
          *,
          schemes (
            id,
            name,
            description,
            subsidy_percentage,
            eligibility,
            application_process
          )
        `)
        .order('id');
      
      if (error) {
        console.error('Error fetching stores:', error);
        return [];
      }
      
      return stores || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  }

  async getStoreById(id) {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select(`
          *,
          schemes (
            id,
            name,
            description,
            subsidy_percentage,
            eligibility,
            application_process
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching store:', error);
        return null;
      }
      
      return store;
    } catch (error) {
      console.error('Error fetching store by ID:', error);
      return null;
    }
  }

  async filterStores(filters) {
    try {
      let query = supabase
        .from('stores')
        .select(`
          *,
          schemes (
            id,
            name,
            description,
            subsidy_percentage,
            eligibility,
            application_process
          )
        `);
      
      // Apply district filter
      if (filters.district && filters.district !== 'all') {
        query = query.ilike('district', filters.district);
      }
      
      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      const { data: stores, error } = await query.order('id');
      
      if (error) {
        console.error('Error filtering stores:', error);
        return [];
      }
      
      return stores || [];
    } catch (error) {
      console.error('Error in filterStores:', error);
      return [];
    }
  }

  // ================= COMMENT OPERATIONS =================

  async getComments(storeId) {
    try {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      return comments || [];
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    }
  }

  async addComment(storeId, comment, rating) {
    if (!this.currentUser) {
      throw new Error('You must be logged in to add a comment');
    }

    try {
      const newComment = {
        store_id: parseInt(storeId),
        user_email: this.currentUser.email,
        user_name: this.currentUser.user_metadata?.fullName || this.currentUser.email.split('@')[0],
        comment: comment.trim(),
        rating: parseInt(rating)
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        throw new Error('Failed to add comment. Please try again.');
      }
      
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
      // First, check if the comment exists and belongs to the current user
      const { data: comment, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .eq('store_id', storeId)
        .eq('user_email', this.currentUser.email)
        .single();
      
      if (fetchError || !comment) {
        throw new Error('Comment not found or you can only delete your own comments');
      }
      
      // Delete the comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) {
        console.error('Error deleting comment:', deleteError);
        throw new Error('Failed to delete comment. Please try again.');
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