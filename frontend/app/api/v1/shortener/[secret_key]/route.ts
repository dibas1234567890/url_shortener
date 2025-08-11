export async function GET(request: Request, { params }: { params: { secret_key: string } }) {
  const { secret_key } = params

  try {
    console.log("API URL:", process.env.NEXT_PUBLIC_FASTAPI_URL)

    const response = await fetch(`${process.env.FASTAPI_URL}/api/v1/shortener/${secret_key}`, {
      
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 301) {
      const location = response.headers.get("location")
      if (location) {
        return Response.redirect(location, 301)
      }
    }

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    return Response.json({ message: "URL not found in database" }, { status: 404 })
  }
}
