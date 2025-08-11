"use client"

import { useState, useEffect } from "react"
import { User, Mail, AtSign } from "lucide-react"

interface UserData {
  username: string
  email: string
  _id?: string
}

export function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserFromToken = () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setLoading(false)
          return
        }

        // Decode JWT token to get user email
        const payload = JSON.parse(atob(token.split(".")[1]))
        const email = payload.sub

        // Get username from localStorage if stored during login/register
        const storedUsername = localStorage.getItem("username")

        if (email) {
          setUser({
            email: email,
            username: storedUsername || email.split("@")[0], // Fallback to email prefix
          })
        }
      } catch (error) {
        console.error("Failed to decode token:", error)
      } finally {
        setLoading(false)
      }
    }

    getUserFromToken()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <User className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-4 text-gray-600">
      <div className="flex items-center gap-2">
        <AtSign className="h-4 w-4" />
        <span className="text-sm font-medium">{user.username}</span>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        <span className="text-sm">{user.email}</span>
      </div>
    </div>
  )
}
