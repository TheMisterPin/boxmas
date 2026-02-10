/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

import api from '../lib/axios'

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('authToken')
    if (token) {
      // You could validate the token here with the server
      // For now, we'll assume it's valid and extract user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.userId,
          email: payload.email,
          name: payload.email, // Using email as name for now
        })
      } catch (error) {
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token } = response.data

      localStorage.setItem('authToken', token)
      setUser(userData)
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
