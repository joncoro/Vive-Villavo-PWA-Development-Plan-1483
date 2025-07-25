import { create } from 'zustand'
import { supabase, USER_ROLES } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  userRole: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      console.log('🔄 Initializing auth store...')
      set({ loading: true, error: null })
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        set({ error: sessionError.message })
      }

      if (session?.user) {
        console.log('👤 Found existing session for user:', session.user.id)
        await get().loadUserData(session.user)
      } else {
        console.log('👤 No existing session found')
        set({ user: null, userRole: null, profile: null })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await get().loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, userRole: null, profile: null })
        }
      })
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  loadUserData: async (user) => {
    try {
      console.log('📊 Loading user data for:', user.id)
      
      // Set user first
      set({ user, error: null })

      // Load user profile with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('🔨 Creating new profile for user:', user.id)
          
          const { data: newProfile, error: createError } = await supabase
            .from('usuarios')
            .insert({
              id: user.id,
              email: user.email,
              nombre: user.user_metadata?.nombre || user.email.split('@')[0],
              intereses: []
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating profile:', createError)
            set({ profile: null, userRole: USER_ROLES.USER })
          } else {
            console.log('✅ Profile created successfully:', newProfile)
            set({ profile: newProfile, userRole: USER_ROLES.USER })
          }
        } else {
          console.error('❌ Profile error:', profileError)
          set({ profile: null, userRole: USER_ROLES.USER })
        }
      } else {
        console.log('✅ Profile loaded successfully:', profile)
        set({ profile })
      }

      // Load user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('rol')
        .eq('usuario_id', user.id)
        .single()

      if (roleError) {
        console.error('Role error:', roleError)
        
        // If role doesn't exist, create default role
        if (roleError.code === 'PGRST116') {
          console.log('🔨 Creating default role for user:', user.id)
          
          const { error: createRoleError } = await supabase
            .from('user_roles')
            .insert({
              usuario_id: user.id,
              rol: USER_ROLES.USER
            })

          if (createRoleError) {
            console.error('❌ Error creating role:', createRoleError)
          }
          
          set(state => ({ ...state, userRole: USER_ROLES.USER }))
        } else {
          console.error('❌ Role error:', roleError)
          set(state => ({ ...state, userRole: USER_ROLES.USER }))
        }
      } else {
        console.log('✅ Role loaded:', roleData?.rol)
        set(state => ({ ...state, userRole: roleData?.rol || USER_ROLES.USER }))
      }

    } catch (error) {
      console.error('❌ Error loading user data:', error)
      set({ profile: null, userRole: USER_ROLES.USER, error: error.message })
    }
  },

  signIn: async (email, password) => {
    try {
      set({ error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ error: null })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error

      // Create user profile if user was created
      if (data.user && !data.user.identities?.length) {
        // User already exists
        throw new Error('Ya existe una cuenta con este correo electrónico')
      }

      if (data.user) {
        try {
          // Create profile
          await supabase.from('usuarios').insert({
            id: data.user.id,
            email: data.user.email,
            nombre: userData.nombre,
            intereses: []
          })

          // Assign default role
          await supabase.from('user_roles').insert({
            usuario_id: data.user.id,
            rol: USER_ROLES.USER
          })
        } catch (dbError) {
          console.error('Error creating user profile:', dbError)
        }
      }

      return data
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  signOut: async () => {
    try {
      set({ error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, userRole: null, profile: null })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      console.log('🔄 Updating profile for user:', user.id)
      console.log('📝 Updates to apply:', updates)
      set({ error: null })

      // Validate updates
      if (!updates || typeof updates !== 'object') {
        throw new Error('Datos de actualización inválidos')
      }

      // Clean updates
      const cleanUpdates = {}
      if (updates.nombre && typeof updates.nombre === 'string') {
        cleanUpdates.nombre = updates.nombre.trim()
      }
      if (updates.intereses && Array.isArray(updates.intereses)) {
        cleanUpdates.intereses = updates.intereses
      }

      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error('No hay cambios válidos para actualizar')
      }

      console.log('✅ Clean updates to send:', cleanUpdates)

      // Update profile
      const { data, error } = await supabase
        .from('usuarios')
        .update(cleanUpdates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error updating profile:', error)
        
        if (error.code === 'PGRST116') {
          throw new Error('Perfil no encontrado. Intenta cerrar sesión e ingresar nuevamente.')
        } else if (error.code === '42501') {
          throw new Error('No tienes permisos para actualizar este perfil.')
        } else if (error.message.includes('duplicate key')) {
          throw new Error('Ya existe un perfil con estos datos.')
        } else {
          throw new Error(`Error de base de datos: ${error.message}`)
        }
      }

      if (!data) {
        throw new Error('No se recibieron datos después de la actualización')
      }

      console.log('✅ Profile updated successfully:', data)

      // Update local state
      set(state => ({ ...state, profile: data }))

      return data
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      set({ error: error.message })
      
      if (error.message.includes('Error al actualizar perfil')) {
        throw error
      } else {
        throw new Error(`Error al actualizar perfil: ${error.message}`)
      }
    }
  },

  resetPassword: async (email) => {
    try {
      set({ error: null })
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`
      })
      if (error) throw error
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updatePassword: async (password) => {
    try {
      set({ error: null })
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))

export default useAuthStore