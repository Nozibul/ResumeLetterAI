/**
 * @file slices/authSlice.js
 * @description Authentication state management for ResumeLetterAI
 * @author Nozibul Islam
 * 
 * Architecture:
 * - Redux for STATE only (user, isAuthenticated, loading, error)
 * - Backend handles token via httpOnly cookie (NO localStorage)
 * - Redux Persist saves user data (NOT token)
 * - Reuses existing authService for API calls
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/features/auth/api/authApi';


// ==========================================
// INITIAL STATE
// ==========================================

const initialState = {
  user: null,                 // User object from backend
  isAuthenticated: false,     // true if logged in AND email verified
  loading: false,             // API call in progress
  error: null,                // Error message from API
};

// ==========================================
// ASYNC THUNKS (API Calls via authService)
// ==========================================

/**
 * Register user
 * Backend sets httpOnly cookie automatically
 */
// export const registerUser = createAsyncThunk(
//   'auth/register',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await authService.register(userData); // Backend returns: { success: true, data: { user } }
      
//       if (response.success) {
//         // ✅ NO localStorage - cookie set by backend
//         return response.data;
//       }
//     } catch (error) {
//       const message = error.response?.data?.message || error.message || 'Registration failed';
//       return rejectWithValue(message);
//     }
//   }
// );

/**
 * Login user
 * Backend sets httpOnly cookie automatically
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        console.log("RES", response)
        return response;
      } else {
        throw new Error('Login failed'); 
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch current user profile
 * Cookie automatically sent by browser
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      
      if (response.success) {
        return response.data.user;
      }
    } catch (error) {
      // ✅ NO localStorage removal - backend handles cookie
      return rejectWithValue('Session expired');
    }
  }
);

/**
 * Logout user
 * Backend clears httpOnly cookie
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      // ✅ NO localStorage - backend clears cookie
      return null;
    } catch (error) {
      // ✅ Even if API fails, just clear Redux state
      // Backend should handle cookie expiry
      return null;
    }
  }
);

/**
 * Update profile
 * Cookie automatically sent by browser
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        return response.data.user;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous actions
    
    /**
     * Clear auth state (manual logout without API call)
     * ✅ Only clears Redux state, NOT localStorage
     */
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    
    
    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Set user manually (for SSR or external auth)
     */
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload?.isEmailVerified || false;
    },
  },
  
  extraReducers: (builder) => {

    // ==========================================
    // REGISTER
    // ==========================================
    // builder
    //   .addCase(registerUser.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(registerUser.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.user = action.payload.user;
    //     state.isAuthenticated = action.payload.user.isEmailVerified;
    //     state.error = null;
    //   })
    //   .addCase(registerUser.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });

    // ==========================================
    // LOGIN
    // ==========================================
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // Store user data in Redux (Redux Persist will save to localStorage)
        state.user = action.payload.data.user;
        state.isAuthenticated = action.payload.data.user.isEmailVerified;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // ==========================================
    // FETCH CURRENT USER
    // ==========================================
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = action.payload.isEmailVerified;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // ==========================================
    // LOGOUT
    // ==========================================
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even on error, clear state
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });

    // ==========================================
    // UPDATE PROFILE
    // ==========================================
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==========================================
// EXPORTS
// ==========================================

// Actions
export const { clearAuth, clearError, setUser } = authSlice.actions;

// Reducer
export default authSlice.reducer;

// Selectors (for convenience)
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
