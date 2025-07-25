import {create} from 'zustand'
import {supabase,CONTENT_STATUS,calculateRewards} from '../lib/supabase'
import {startOfMonth,endOfMonth} from 'date-fns'

const useAppStore = create((set, get) => ({
  eventos: [],
  comunidades: [],
  lugares: [],
  userRewards: 0,
  userMood: null,
  loading: false,

  // Events
  loadEventos: async (filters = {}) => {
    set({ loading: true })
    try {
      console.log('🔍 Loading eventos with filters:', filters)
      
      let query = supabase
        .from('eventos_vv23')
        .select('*')
        .eq('estado', CONTENT_STATUS.APPROVED) // Solo eventos aprobados

      if (filters.thisMonth) {
        const now = new Date()
        const start = startOfMonth(now).toISOString()
        const end = endOfMonth(now).toISOString()
        query = query.gte('fecha', start).lte('fecha', end)
        console.log('📅 Filtering by this month:', start, 'to', end)
      }

      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria)
      }

      const { data, error } = await query.order('fecha', { ascending: true })

      if (error) {
        console.error('❌ Error loading eventos:', error)
        throw error
      }

      console.log('✅ Eventos loaded successfully:', data?.length || 0, 'eventos')
      if (data && data.length > 0) {
        console.log('📋 Sample eventos:', data.slice(0, 3))
      } else {
        console.log('⚠️ No eventos found with the current filters')
      }
      
      set({ eventos: data || [] })
    } catch (error) {
      console.error('❌ Error loading eventos:', error)
      set({ eventos: [] })
    } finally {
      set({ loading: false })
    }
  },

  loadComunidades: async () => {
    try {
      console.log('🔍 Loading comunidades...')
      
      const { data, error } = await supabase
        .from('comunidades_vv23')
        .select('*')
        .eq('estado', CONTENT_STATUS.APPROVED) // Solo comunidades aprobadas
        .order('creado_en', { ascending: false })

      if (error) {
        console.error('❌ Error loading comunidades:', error)
        throw error
      }

      console.log('✅ Comunidades loaded:', data?.length || 0, 'comunidades')
      set({ comunidades: data || [] })
    } catch (error) {
      console.error('❌ Error loading comunidades:', error)
      set({ comunidades: [] })
    }
  },

  loadLugares: async () => {
    try {
      console.log('🔍 Loading lugares...')
      
      const { data, error } = await supabase
        .from('lugares_vv23')
        .select('*')
        .eq('estado', CONTENT_STATUS.APPROVED) // Solo lugares aprobados
        .order('creado_en', { ascending: false })

      if (error) {
        console.error('❌ Error loading lugares:', error)
        throw error
      }

      console.log('✅ Lugares loaded:', data?.length || 0, 'lugares')
      set({ lugares: data || [] })
    } catch (error) {
      console.error('❌ Error loading lugares:', error)
      set({ lugares: [] })
    }
  },

  // User interactions
  loadUserRewards: async (userId) => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('rewards_vv23')
        .select('puntos_obtenidos')
        .eq('usuario_id', userId)

      if (error) {
        console.error('Error loading user rewards:', error)
        return
      }

      const totalPoints = data?.reduce((sum, reward) => sum + reward.puntos_obtenidos, 0) || 0
      set({ userRewards: totalPoints })
    } catch (error) {
      console.error('Error loading user rewards:', error)
    }
  },

  loadUserMood: async (userId) => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('moods_vv23')
        .select('mood_actual')
        .eq('usuario_id', userId)
        .order('fecha', { ascending: false })
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user mood:', error)
        return
      }

      const mood = data && data.length > 0 ? data[0].mood_actual : null
      set({ userMood: mood })
    } catch (error) {
      console.error('Error loading user mood:', error)
    }
  },

  updateUserMood: async (userId, mood) => {
    if (!userId) return
    try {
      const { error } = await supabase
        .from('moods_vv23')
        .upsert({
          usuario_id: userId,
          mood_actual: mood,
          fecha: new Date().toISOString()
        })

      if (error) throw error
      set({ userMood: mood })
    } catch (error) {
      console.error('Error updating mood:', error)
      throw error
    }
  },

  // Content creation with better error handling
  createEvento: async (eventoData) => {
    try {
      console.log('Creating evento with data:', eventoData)
      
      // Validar campos requeridos
      if (!eventoData.titulo || !eventoData.descripcion || !eventoData.fecha || !eventoData.ubicacion) {
        throw new Error('Faltan campos requeridos para crear el evento')
      }

      // Preparar datos con valores por defecto
      const dataToInsert = {
        titulo: eventoData.titulo,
        descripcion: eventoData.descripcion,
        fecha: eventoData.fecha,
        hora: eventoData.hora || null,
        ubicacion: eventoData.ubicacion,
        precio: eventoData.precio ? parseInt(eventoData.precio) : 0,
        categoria: eventoData.categoria || null,
        imagen_url: eventoData.imagen_url || null,
        geolocalizacion: eventoData.geolocalizacion || null,
        comunidad_id: eventoData.comunidad_id || null,
        creado_por: eventoData.creado_por,
        estado: CONTENT_STATUS.PENDING,
        comentario_admin: null
      }

      const { data, error } = await supabase
        .from('eventos_vv23')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating evento:', error)
        throw error
      }

      console.log('Evento created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating evento:', error)
      throw new Error(`Error al crear evento: ${error.message}`)
    }
  },

  createComunidad: async (comunidadData) => {
    try {
      console.log('Creating comunidad with data:', comunidadData)
      
      // Validar campos requeridos
      if (!comunidadData.nombre || !comunidadData.descripcion) {
        throw new Error('Faltan campos requeridos para crear la comunidad')
      }

      // Preparar datos con valores por defecto
      const dataToInsert = {
        nombre: comunidadData.nombre,
        descripcion: comunidadData.descripcion,
        intereses: comunidadData.intereses || [],
        imagen_url: comunidadData.imagen_url || null,
        geolocalizacion: comunidadData.geolocalizacion || null,
        ubicacion: comunidadData.ubicacion || null, // Agregar ubicación si existe en la tabla
        creado_por: comunidadData.creado_por,
        estado: CONTENT_STATUS.PENDING,
        comentario_admin: null
      }

      const { data, error } = await supabase
        .from('comunidades_vv23')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating comunidad:', error)
        throw error
      }

      console.log('Comunidad created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating comunidad:', error)
      throw new Error(`Error al crear comunidad: ${error.message}`)
    }
  },

  createLugar: async (lugarData) => {
    try {
      console.log('Creating lugar with data:', lugarData)
      
      // Validar campos requeridos
      if (!lugarData.nombre || !lugarData.descripcion || !lugarData.direccion) {
        throw new Error('Faltan campos requeridos para crear el lugar')
      }

      // Preparar datos con valores por defecto
      const dataToInsert = {
        nombre: lugarData.nombre,
        descripcion: lugarData.descripcion,
        tipo: lugarData.tipo || null,
        direccion: lugarData.direccion,
        geolocalizacion: lugarData.geolocalizacion || null,
        imagen_url: lugarData.imagen_url || null,
        creado_por: lugarData.creado_por,
        estado: CONTENT_STATUS.PENDING,
        comentario_admin: null
      }

      const { data, error } = await supabase
        .from('lugares_vv23')
        .insert(dataToInsert)
        .select()
        .single()

      if (error) {
        console.error('Supabase error creating lugar:', error)
        throw error
      }

      console.log('Lugar created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating lugar:', error)
      throw new Error(`Error al crear lugar: ${error.message}`)
    }
  },

  // Rewards
  addReward: async (userId, eventoId, amount) => {
    if (!userId) return
    try {
      const points = calculateRewards(amount)
      const { data, error } = await supabase
        .from('rewards_vv23')
        .insert({
          usuario_id: userId,
          evento_id: eventoId,
          monto_cop: amount,
          puntos_obtenidos: points,
          fecha: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update local rewards
      set({ userRewards: get().userRewards + points })
      return data
    } catch (error) {
      console.error('Error adding reward:', error)
      throw error
    }
  },

  // Admin functions
  loadPendingContent: async () => {
    try {
      const [eventosRes, comunidadesRes, lugaresRes] = await Promise.all([
        supabase.from('eventos_vv23').select('*').eq('estado', CONTENT_STATUS.PENDING),
        supabase.from('comunidades_vv23').select('*').eq('estado', CONTENT_STATUS.PENDING),
        supabase.from('lugares_vv23').select('*').eq('estado', CONTENT_STATUS.PENDING)
      ])

      return {
        eventos: eventosRes.data || [],
        comunidades: comunidadesRes.data || [],
        lugares: lugaresRes.data || []
      }
    } catch (error) {
      console.error('Error loading pending content:', error)
      throw error
    }
  },

  approveContent: async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ estado: CONTENT_STATUS.APPROVED })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error approving content:', error)
      throw error
    }
  },

  rejectContent: async (table, id, comentario) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ 
          estado: CONTENT_STATUS.REJECTED,
          comentario_admin: comentario 
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting content:', error)
      throw error
    }
  }
}))

export default useAppStore