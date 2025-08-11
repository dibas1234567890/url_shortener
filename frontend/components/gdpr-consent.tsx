"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cookie, X } from "lucide-react"

export function GDPRConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = localStorage.getItem("gdpr-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("gdpr-consent", JSON.stringify(consentData))
    setShowConsent(false)
  }

  const handleAcceptSelected = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("gdpr-consent", JSON.stringify(consentData))
    setShowConsent(false)
  }

  const handleReject = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("gdpr-consent", JSON.stringify(consentData))
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-blue-600" />
            <CardTitle>Cookie Preferences</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReject} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-base">
            We use cookies to enhance your experience, analyze site traffic, and personalize content. Choose your
            preferences below or accept all to continue.
          </CardDescription>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Necessary Cookies</h4>
                <p className="text-sm text-gray-600">Required for basic site functionality</p>
              </div>
              <div className="text-sm text-gray-500">Always Active</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Analytics Cookies</h4>
                <p className="text-sm text-gray-600">Help us understand how you use our site</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Marketing Cookies</h4>
                <p className="text-sm text-gray-600">Used to show you relevant advertisements</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleAcceptAll} className="flex-1">
              Accept All
            </Button>
            <Button onClick={handleAcceptSelected} variant="outline" className="flex-1 bg-transparent">
              Accept Selected
            </Button>
            <Button onClick={handleReject} variant="ghost" className="flex-1">
              Reject All
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can change your preferences at any time in your account settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
