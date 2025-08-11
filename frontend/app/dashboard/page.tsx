"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, Plus, Copy, ExternalLink, BarChart3, LogOut, Loader2, List } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createShortUrls, getUserUrls } from "@/lib/api"
import { UserProfile } from "@/components/user-profile"
import { URLManagement } from "@/components/url-management"

interface ShortenedUrl {
  key: string
  redir_target_url: string
  clicks: number
  time_metadata: string
  is_active: boolean
}

export default function DashboardPage() {
  const [urls, setUrls] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [createdUrls, setCreatedUrls] = useState<ShortenedUrl[]>([])
  const [invalidUrls, setInvalidUrls] = useState<string[]>([])
  const [urlsLoaded, setUrlsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Check if token is expired by decoding it
        const payload = JSON.parse(atob(token.split(".")[1]))
        const currentTime = Date.now() / 1000

        if (payload.exp < currentTime) {
          // Token is expired
          localStorage.removeItem("access_token")
          localStorage.removeItem("token_type")
          localStorage.removeItem("username")
          router.push("/login")
        } else {
          // Token is valid, preload user URLs to ensure they're available for redirects
          await preloadUserUrls()
        }
      } catch (error) {
        // Token is invalid
        localStorage.removeItem("access_token")
        localStorage.removeItem("token_type")
        localStorage.removeItem("username")
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const preloadUserUrls = async () => {
    try {
      await getUserUrls()
      setUrlsLoaded(true)
    } catch (error) {
      console.error("Failed to preload user URLs:", error)
      setUrlsLoaded(true) // Set to true anyway to prevent blocking
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const urlList = urls.split("\n").filter((url) => url.trim())

    if (urlList.length === 0) {
      setError("Please enter at least one URL")
      setLoading(false)
      return
    }

    try {
      const response = await createShortUrls({ redir_target_url: urlList })

      if (response.created) {
        setCreatedUrls(response.created)
        setInvalidUrls(response.invalid_urls || [])
        setSuccess(`Successfully created ${response.created.length} short URLs`)
        setUrls("")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create short URLs")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    localStorage.removeItem("username")
    router.push("/")
  }

  const getShortUrl = (key: string) => {
    // Use the secret_key for the redirect, not the key
    return `${window.location.origin}/api/v1/shortener/${key}`
  }

  const handleExternalLink = (url: ShortenedUrl) => {
    // Ensure URLs are loaded before allowing redirects
    if (!urlsLoaded) {
      setError("Please wait for URLs to load before testing redirects")
      return
    }
    window.open(getShortUrl(url.key), "_blank")
  }

  // Show loading state until URLs are preloaded
  if (!urlsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="border-0 shadow-xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Link2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LinkShort</span>
          </Link>
          <div className="flex items-center gap-4">
            <UserProfile />
            <Button onClick={handleLogout} variant="ghost" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Create and manage your shortened URLs</p>
          </div>

          <Tabs defaultValue="manage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Manage URLs
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create URLs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <URLManagement />
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* URL Creation Form */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create Short URLs
                    </CardTitle>
                    <CardDescription>Enter one or more URLs (one per line) to create short links</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="border-green-200 bg-green-50 text-green-800">
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="urls">URLs to Shorten</Label>
                        <Textarea
                          id="urls"
                          placeholder="https://example.com&#10;https://another-example.com&#10;https://third-example.com"
                          value={urls}
                          onChange={(e) => setUrls(e.target.value)}
                          rows={6}
                          required
                        />
                        <p className="text-sm text-gray-500">
                          Enter one URL per line. All URLs must be valid and include http:// or https://
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating URLs...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Short URLs
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-6">
                  {/* Created URLs */}
                  {createdUrls.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="h-5 w-5 text-green-600" />
                          Created URLs
                        </CardTitle>
                        <CardDescription>Your newly created short URLs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {createdUrls.map((url, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-green-50 border-green-200">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {url.key}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <BarChart3 className="h-3 w-3" />
                                    {url.clicks} clicks
                                  </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">{getShortUrl(url.key)}</p>
                                <p className="text-sm text-gray-600 truncate">→ {url.redir_target_url}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(getShortUrl(url.key))}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleExternalLink(url)}>
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Invalid URLs */}
                  {invalidUrls.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-red-600">Invalid URLs</CardTitle>
                        <CardDescription>These URLs could not be processed</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {invalidUrls.map((url, index) => (
                            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800 font-mono">{url}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
