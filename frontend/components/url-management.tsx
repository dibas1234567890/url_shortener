"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Link2,
  Copy,
  ExternalLink,
  BarChart3,
  Calendar,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { getUserUrls, updateUrlActive, getRedirectUrl } from "@/lib/api"

interface UserUrl {
  _id: string
  key: string
  secret_key: string
  redir_target_url: string
  clicks: number
  is_active: boolean
  time_metadata: string
  user_email: string
}

export function URLManagement() {
  const [urls, setUrls] = useState<UserUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [updatingUrl, setUpdatingUrl] = useState<string | null>(null)

  const fetchUrls = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Fetching user URLs...")

      const userUrls = await getUserUrls()
      console.log("Fetched URLs:", userUrls)

      setUrls(userUrls)
      setSuccess(`Loaded ${userUrls.length} URLs successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error fetching URLs:", err)
      setError(err.message || "Failed to fetch URLs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  const handleToggleActive = async (secretKey: string, currentStatus: boolean) => {
    try {
      setUpdatingUrl(secretKey)
      setError("")

      console.log(`Updating URL ${secretKey} to ${!currentStatus ? "active" : "inactive"}`)

      const result = await updateUrlActive(secretKey, !currentStatus)
      console.log("Update result:", result)

      // Update local state
      setUrls((prevUrls) =>
        prevUrls.map((url) => (url.secret_key === secretKey ? { ...url, is_active: !currentStatus } : url)),
      )

      setSuccess(`URL ${!currentStatus ? "activated" : "deactivated"} successfully`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error("Error updating URL:", err)
      setError(err.message || "Failed to update URL status")
    } finally {
      setUpdatingUrl(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSuccess("URL copied to clipboard!")
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError("Failed to copy URL")
    }
  }

  const handleExternalLink = (url: UserUrl) => {
    if (!url.is_active) {
      setError("Cannot open inactive URL")
      return
    }

    const redirectUrl = getRedirectUrl(url.secret_key)
    window.open(redirectUrl, "_blank")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading your URLs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-600" />
              My URLs ({urls.length})
            </CardTitle>
            <CardDescription>Manage all your shortened URLs. Redirects happen at the root level.</CardDescription>
          </div>
          <Button onClick={fetchUrls} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {urls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Link2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No URLs yet</p>
            <p>Create your first shortened URL to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">


            {urls.map((url) => (
              <div
                key={url._id}
                className={`p-4 border rounded-lg transition-all ${
                  url.is_active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={url.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                      >
                        Key: {url.key}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Secret: {url.secret_key}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <BarChart3 className="h-3 w-3" />
                        {url.clicks} clicks
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(url.time_metadata)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {url.is_active ? (
                          <>
                            <Eye className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-500">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Short URL: {getRedirectUrl(url.secret_key)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">→ {url.redir_target_url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={url.is_active}
                        onCheckedChange={() => handleToggleActive(url.secret_key, url.is_active)}
                        disabled={updatingUrl === url.secret_key}
                      />
                      {updatingUrl === url.secret_key && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(getRedirectUrl(url.secret_key))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExternalLink(url)}
                      disabled={!url.is_active}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
