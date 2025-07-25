import React from 'react'
import { motion } from 'framer-motion'
import { MOOD_TYPES } from '../../lib/supabase'

const moodConfig = {
  [MOOD_TYPES.HAPPY]: { emoji: '😊', label: 'Feliz', color: 'bg-yellow-100 text-yellow-800' },
  [MOOD_TYPES.EXCITED]: { emoji: '🤩', label: 'Emocionado', color: 'bg-orange-100 text-orange-800' },
  [MOOD_TYPES.RELAXED]: { emoji: '😌', label: 'Relajado', color: 'bg-blue-100 text-blue-800' },
  [MOOD_TYPES.ADVENTUROUS]: { emoji: '🏃‍♂️', label: 'Aventurero', color: 'bg-green-100 text-green-800' },
  [MOOD_TYPES.SOCIAL]: { emoji: '🎉', label: 'Social', color: 'bg-purple-100 text-purple-800' },
  [MOOD_TYPES.CULTURAL]: { emoji: '🎭', label: 'Cultural', color: 'bg-pink-100 text-pink-800' },
}

const MoodSelector = ({ selectedMood, onMoodSelect, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Object.entries(moodConfig).map(([mood, config]) => (
        <motion.button
          key={mood}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodSelect(mood)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-colors duration-200 border-2
            ${selectedMood === mood
              ? `${config.color} border-current`
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <span className="text-lg">{config.emoji}</span>
          <span>{config.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

export default MoodSelector