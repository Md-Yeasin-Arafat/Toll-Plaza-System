import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_API_KEY environment variable is not set')
      return NextResponse.json({ 
        error: 'Google Cloud API key not configured. Please set GOOGLE_CLOUD_API_KEY environment variable.' 
      }, { status: 500 })
    }

    if (apiKey === 'your_google_cloud_api_key_here' || apiKey === 'your_actual_api_key_here' || apiKey.startsWith('AIzaSyC-your-actual-api-key-here')) {
      console.error('GOOGLE_CLOUD_API_KEY is set to placeholder value')
      return NextResponse.json({
        error: 'GOOGLE_CLOUD_API_KEY is set to a placeholder value. Please update your .env.local file with your actual Google Cloud Vision API key and restart the development server.'
      }, { status: 500 })
    }

    console.log('Using API key:', apiKey.substring(0, 10) + '...')

    // Call Google Cloud Vision API
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`
    
    const requestBody = {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 50,
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 50,
            },
          ],
          imageContext: {
            languageHints: ['bn', 'en'], // Bengali and English
          },
        },
      ],
    }

    console.log('Calling Vision API with URL:', visionApiUrl)
    console.log('Request body features:', requestBody.requests[0].features)

    const response = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('Vision API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vision API error response:', errorText)
      
      let errorMessage = `Vision API error: ${response.status} ${response.statusText}`
      
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error) {
          errorMessage = `Vision API error: ${errorJson.error.message || errorJson.error.code}`
          
          // Specific handling for API key errors
          if (errorJson.error.code === 400 && errorJson.error.message.includes('API key not valid')) {
            errorMessage = 'Invalid Google Cloud API key. Please check your API key and ensure the Vision API is enabled.'
          }
        }
      } catch (parseError) {
        console.error('Error parsing Vision API error response:', parseError)
      }
      
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log('Vision API success response received')
    
    if (data.responses && data.responses[0]) {
      // Check if there are any errors in the response
      if (data.responses[0].error) {
        console.error('Vision API response error:', data.responses[0].error)
        return NextResponse.json({ 
          error: `Vision API response error: ${data.responses[0].error.message}` 
        }, { status: 400 })
      }
      
      return NextResponse.json(data.responses[0])
    } else {
      console.error('No response from Vision API:', data)
      return NextResponse.json({ error: 'No response from Vision API' }, { status: 500 })
    }

  } catch (error) {
    console.error('Vision API route error:', error)
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
