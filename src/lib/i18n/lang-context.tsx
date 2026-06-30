'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'es' | 'en'

const translations = {
  es: {
    // Auth
    login: 'Iniciar sesión',
    register: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Email',
    password: 'Contraseña',
    name: 'Nombre',
    noAccount: '¿No tenés cuenta?',
    hasAccount: '¿Ya tenés cuenta?',
    loginError: 'Error al iniciar sesión. Verificá tus credenciales.',
    registerError: 'Error al registrarse. Intentá de nuevo.',
    loading: 'Cargando...',

    // Nav
    dashboard: 'Rutinas',
    exercises: 'Ejercicios',
    history: 'Historial',
    workout: 'Entrenar',

    // Dashboard
    myRoutines: 'Mis Rutinas',
    newRoutine: '+ Nueva Rutina',
    noRoutines: 'Todavía no tenés rutinas.',
    createFirst: 'Creá tu primera rutina',

    // Routines
    routine: 'Rutina',
    routineName: 'Nombre de la rutina',
    description: 'Descripción (opcional)',
    day: 'Día (opcional)',
    muscleGroup: 'Grupo muscular (opcional)',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    editRoutine: 'Editar rutina',
    deleteRoutine: '¿Eliminar esta rutina?',
    confirmDelete: 'Confirmar',
    addExercise: '+ Agregar ejercicio',
    noExercises: 'Esta rutina no tiene ejercicios todavía.',
    warmup: 'Calentamiento',
    mainExercises: 'Ejercicios principales',
    sets: 'Series',
    reps: 'Repeticiones',
    weight: 'Peso (kg)',
    notes: 'Notas',
    order: 'Orden',
    isWarmup: 'Es calentamiento',
    startWorkout: '▶ Iniciar entrenamiento',
    createdAt: 'Creado el',

    // Exercises
    exerciseList: 'Mis Ejercicios',
    newExercise: '+ Nuevo Ejercicio',
    noExercisesYet: 'Todavía no tenés ejercicios.',
    exerciseName: 'Nombre del ejercicio',
    primaryMuscle: 'Músculo principal',
    secondaryMuscles: 'Músculos secundarios (separados por coma)',
    type: 'Tipo',
    typeStrength: 'Fuerza',
    typeWarmup: 'Calentamiento',
    typeMobility: 'Movilidad',
    typeCardio: 'Cardio',
    typeOther: 'Otro',
    editExercise: 'Editar ejercicio',
    deleteExercise: '¿Eliminar este ejercicio?',
    viewHistory: 'Ver historial',

    // Workout
    startSession: 'Iniciar sesión',
    selectRoutine: 'Seleccionar rutina',
    freeWorkout: 'Entrenamiento libre',
    addSet: '+ Agregar serie',
    finishWorkout: 'Finalizar entrenamiento',
    sessionDate: 'Fecha de la sesión',
    sessionNotes: 'Notas de la sesión',
    set: 'Serie',
    deleteSet: 'Eliminar serie',

    // History
    exerciseHistory: 'Historial de ejercicio',
    historicalRecord: 'Récord histórico',
    lastWorkout: 'Último entrenamiento',
    recentSessions: 'Sesiones recientes',
    noHistory: 'Todavía no registraste este ejercicio.',
    kg: 'kg',
    date: 'Fecha',

    // General
    back: '← Volver',
    confirm: 'Confirmar',
    optional: 'opcional',
    required: 'requerido',
    appName: 'Gym Tracker',
  },
  en: {
    // Auth
    login: 'Sign in',
    register: 'Sign up',
    logout: 'Sign out',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginError: 'Login failed. Check your credentials.',
    registerError: 'Registration failed. Please try again.',
    loading: 'Loading...',

    // Nav
    dashboard: 'Routines',
    exercises: 'Exercises',
    history: 'History',
    workout: 'Train',

    // Dashboard
    myRoutines: 'My Routines',
    newRoutine: '+ New Routine',
    noRoutines: "You don't have any routines yet.",
    createFirst: 'Create your first routine',

    // Routines
    routine: 'Routine',
    routineName: 'Routine name',
    description: 'Description (optional)',
    day: 'Day (optional)',
    muscleGroup: 'Main muscle group (optional)',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    editRoutine: 'Edit routine',
    deleteRoutine: 'Delete this routine?',
    confirmDelete: 'Confirm',
    addExercise: '+ Add exercise',
    noExercises: 'This routine has no exercises yet.',
    warmup: 'Warm-up',
    mainExercises: 'Main exercises',
    sets: 'Sets',
    reps: 'Reps',
    weight: 'Weight (kg)',
    notes: 'Notes',
    order: 'Order',
    isWarmup: 'Is warm-up',
    startWorkout: '▶ Start workout',
    createdAt: 'Created on',

    // Exercises
    exerciseList: 'My Exercises',
    newExercise: '+ New Exercise',
    noExercisesYet: "You don't have any exercises yet.",
    exerciseName: 'Exercise name',
    primaryMuscle: 'Primary muscle',
    secondaryMuscles: 'Secondary muscles (comma separated)',
    type: 'Type',
    typeStrength: 'Strength',
    typeWarmup: 'Warm-up',
    typeMobility: 'Mobility',
    typeCardio: 'Cardio',
    typeOther: 'Other',
    editExercise: 'Edit exercise',
    deleteExercise: 'Delete this exercise?',
    viewHistory: 'View history',

    // Workout
    startSession: 'Start session',
    selectRoutine: 'Select routine',
    freeWorkout: 'Free workout',
    addSet: '+ Add set',
    finishWorkout: 'Finish workout',
    sessionDate: 'Session date',
    sessionNotes: 'Session notes',
    set: 'Set',
    deleteSet: 'Delete set',

    // History
    exerciseHistory: 'Exercise history',
    historicalRecord: 'Historical record',
    lastWorkout: 'Last workout',
    recentSessions: 'Recent sessions',
    noHistory: "You haven't logged this exercise yet.",
    kg: 'kg',
    date: 'Date',

    // General
    back: '← Back',
    confirm: 'Confirm',
    optional: 'optional',
    required: 'required',
    appName: 'Gym Tracker',
  },
}

export type TranslationKey = keyof typeof translations.es

interface LangContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    const saved = localStorage.getItem('gym-tracker-lang') as Lang | null
    if (saved === 'es' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('gym-tracker-lang', newLang)
  }

  const t = (key: TranslationKey) => translations[lang][key] ?? key

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
