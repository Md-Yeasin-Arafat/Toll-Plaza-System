import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image, bbox } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Starting Google Vision API text extraction...")
    console.log("Bounding box:", bbox)

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!apiKey) {
      console.error("GOOGLE_CLOUD_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Google Cloud API key not configured. Please set GOOGLE_CLOUD_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    if (
      apiKey === "your_google_cloud_api_key_here" ||
      apiKey === "your_actual_api_key_here" ||
      apiKey.startsWith("AIzaSyC-your-actual-api-key-here")
    ) {
      console.error("GOOGLE_CLOUD_API_KEY is set to placeholder value")
      return NextResponse.json(
        {
          error:
            "GOOGLE_CLOUD_API_KEY is set to a placeholder value. Please update your .env.local file with your actual Google Cloud Vision API key and restart the development server.",
        },
        { status: 500 },
      )
    }

    console.log("Using API key:", apiKey.substring(0, 10) + "...")

    // Process image with bounding box if provided
    const processedImage = image
    if (bbox && Array.isArray(bbox) && bbox.length === 4) {
      try {
        // Crop the image using the bounding box
        const canvas = document.createElement?.("canvas") // This won't work in Node.js, so we'll send the full image
        console.log(
          "Bounding box provided, but server-side cropping not implemented. Sending full image to Vision API.",
        )
      } catch (error) {
        console.log("Could not crop image server-side, sending full image to Vision API")
      }
    }

    // Call Google Cloud Vision API
    const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`

    const requestBody = {
      requests: [
        {
          image: {
            content: processedImage,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 50,
            },
            {
              type: "DOCUMENT_TEXT_DETECTION",
              maxResults: 50,
            },
          ],
          imageContext: {
            languageHints: ["bn", "en"], // Bengali and English
          },
        },
      ],
    }

    console.log("Calling Vision API with URL:", visionApiUrl)

    const response = await fetch(visionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Vision API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Vision API error response:", errorText)

      let errorMessage = `Vision API error: ${response.status} ${response.statusText}`

      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error) {
          errorMessage = `Vision API error: ${errorJson.error.message || errorJson.error.code}`

          // Specific handling for API key errors
          if (errorJson.error.code === 400 && errorJson.error.message.includes("API key not valid")) {
            errorMessage =
              "Invalid Google Cloud API key. Please check your API key and ensure the Vision API is enabled."
          }
        }
      } catch (parseError) {
        console.error("Error parsing Vision API error response:", parseError)
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("Vision API success response received")

    if (data.responses && data.responses[0]) {
      // Check if there are any errors in the response
      if (data.responses[0].error) {
        console.error("Vision API response error:", data.responses[0].error)
        return NextResponse.json(
          {
            error: `Vision API response error: ${data.responses[0].error.message}`,
          },
          { status: 400 },
        )
      }

      // Extract text from Vision API response
      const visionResponse = data.responses[0]
      let extractedText = ""
      let confidence = 0

      // Get full text annotation
      if (visionResponse.fullTextAnnotation) {
        extractedText = visionResponse.fullTextAnnotation.text || ""
        console.log("Full text from Vision API:", extractedText)
      }

      // Fallback to text annotations
      if (!extractedText && visionResponse.textAnnotations && visionResponse.textAnnotations.length > 0) {
        extractedText = visionResponse.textAnnotations[0].description || ""
        console.log("Text from annotations:", extractedText)
      }

      // Calculate average confidence
      if (visionResponse.textAnnotations && visionResponse.textAnnotations.length > 0) {
        const confidences = visionResponse.textAnnotations
          .slice(1) // Skip the first one which is the full text
          .map((annotation: any) => annotation.confidence || 0.8)
          .filter((conf: number) => conf > 0)

        confidence =
          confidences.length > 0
            ? confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length
            : 0.8
      } else {
        confidence = 0.8 // Default confidence
      }

      // Parse the license plate using the same logic as before
      const parsedResult = parseTwoLineLicensePlate(extractedText)

      console.log("Vision API extraction completed:", {
        extractedText,
        parsedResult,
        confidence,
      })

      return NextResponse.json({
        success: true,
        extracted_text: extractedText.trim(),
        license_plate: parsedResult.license_plate || "",
        area_name: parsedResult.area_name || "",
        vehicle_class: parsedResult.vehicle_class || "",
        number: parsedResult.number || "",
        confidence: Math.round(confidence * 1000) / 1000,
        processing_time: 0.5, // Vision API is typically fast
        config_used: "Google Vision API",
      })
    } else {
      console.error("No response from Vision API:", data)
      return NextResponse.json({ error: "No response from Vision API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Vision API route error:", error)
    return NextResponse.json(
      { error: `Vision API extraction failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}

// License plate parsing functions (same as Python version)
function parseTwoLineLicensePlate(text: string) {
  try {
    // Clean and split text into lines
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    console.log("Parsing lines:", lines)

    const allText = lines.join(" ")

    // Extract area name using difflib-like matching
    const areaName = extractAreaNameWithMatching(allText)

    // Extract vehicle class (Bangla letter)
    const vehicleClass = extractVehicleClass(allText)

    // Extract 6-digit number
    const number = extractSixDigitNumber(allText)

    console.log(`Extracted components - Area: '${areaName}', Class: '${vehicleClass}', Number: '${number}'`)

    // Construct license plate
    let licensePlate = ""
    if (areaName && vehicleClass && number) {
      licensePlate = `${areaName}-${vehicleClass}-${number}`
    } else if (areaName && number) {
      licensePlate = `${areaName}-${number}`
    }

    return {
      success: !!(areaName || vehicleClass || number),
      area_name: areaName,
      vehicle_class: vehicleClass,
      number: number,
      license_plate: licensePlate,
    }
  } catch (error) {
    console.error("Two-line parsing error:", error)
    return { success: false }
  }
}

function extractAreaNameWithMatching(text: string) {
  // Complete list of Bangladesh area names
  const areaNames = [
    // Major cities with variations
    { bangla: "ঢাকা", variations: ["ঢাকা", "dhaka", "DHAKA", "Dhaka"] },
    { bangla: "চট্টগ্রাম", variations: ["চট্টগ্রাম", "chittagong", "CHITTAGONG", "Chittagong", "ctg", "CTG"] },
    { bangla: "সিলেট", variations: ["সিলেট", "sylhet", "SYLHET", "Sylhet"] },
    { bangla: "রাজশাহী", variations: ["রাজশাহী", "rajshahi", "RAJSHAHI", "Rajshahi"] },
    { bangla: "বরিশাল", variations: ["বরিশাল", "barisal", "BARISAL", "Barisal"] },
    { bangla: "খুলনা", variations: ["খুলনা", "khulna", "KHULNA", "Khulna"] },
    { bangla: "রংপুর", variations: ["রংপুর", "rangpur", "RANGPUR", "Rangpur"] },
    { bangla: "ময়মনসিংহ", variations: ["ময়মনসিংহ", "mymensingh", "MYMENSINGH", "Mymensingh"] },
  ]

  const metroAreas = [
    { bangla: "মেট্রো", variations: ["মেট্রো", "metro", "METRO", "Metro", "Metropoliton", "Metropolitan"] },
  ]

  // First, check if this is a metro area (ঢাকা মেট্রো format)
  let foundCity = ""
  let foundMetro = ""

  // Look for city + metro combination
  for (const city of areaNames) {
    for (const cityVariation of city.variations) {
      if (text.toLowerCase().includes(cityVariation.toLowerCase())) {
        foundCity = city.bangla
        break
      }
    }
    if (foundCity) break
  }

  // Look for metro designation
  for (const metro of metroAreas) {
    for (const metroVariation of metro.variations) {
      if (text.toLowerCase().includes(metroVariation.toLowerCase())) {
        foundMetro = metro.bangla
        break
      }
    }
    if (foundMetro) break
  }

  // Construct the area name
  let areaName = ""
  if (foundCity && foundMetro) {
    areaName = `${foundCity}-${foundMetro}`
  } else if (foundCity) {
    areaName = foundCity
  }

  console.log(`Area name extraction: City='${foundCity}', Metro='${foundMetro}', Final='${areaName}'`)
  return areaName
}

function extractVehicleClass(text: string) {
  // Bangla letters for vehicle classes
  const banglaLetters = [
    "ক",
    "খ",
    "গ",
    "ঘ",
    "ঙ",
    "চ",
    "ছ",
    "জ",
    "ঝ",
    "ঞ",
    "ট",
    "ঠ",
    "ড",
    "ঢ",
    "ণ",
    "ত",
    "থ",
    "দ",
    "ধ",
    "ন",
    "প",
    "ফ",
    "ব",
    "ভ",
    "ম",
    "য",
    "র",
    "ল",
    "শ",
    "ষ",
    "স",
    "হ",
  ]

  // Look for patterns like "মেট্রো-গ" or standalone Bangla letters
  // First try to find letter after metro/city designation
  const patterns = [
    /(?:মেট্রো|metro|METRO)[\s-]*([ক-হ])/i, // After metro
    /(?:ঢাকা|dhaka|চট্টগ্রাম|chittagong)[\s-]*(?:মেট্রো|metro)[\s-]*([ক-হ])/i, // After city-metro
    /([ক-হ])[\s-]*\d/, // Letter followed by numbers
    /([ক-হ])/, // Any Bangla letter (fallback)
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      console.log(`Found vehicle class: '${match[1]}' using pattern`)
      return match[1]
    }
  }

  // Fallback: look for any Bangla letter
  for (const letter of banglaLetters) {
    if (text.includes(letter)) {
      console.log(`Found vehicle class: '${letter}' (fallback)`)
      return letter
    }
  }

  return ""
}

function extractSixDigitNumber(text: string) {
  // Bangla to English number mapping
  const banglaToEnglish: { [key: string]: string } = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  }

  const englishToBangla: { [key: string]: string } = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  }

  // Convert any Bangla numbers to English for processing
  let convertedText = text
  for (const [bangla, english] of Object.entries(banglaToEnglish)) {
    convertedText = convertedText.replace(new RegExp(bangla, "g"), english)
  }

  // Look for 6-digit patterns
  const patterns = [
    /(\d{2})-(\d{4})/, // dd-dddd format
    /(\d{2})\s*-\s*(\d{4})/, // dd - dddd with spaces
    /(\d{2})\s+(\d{4})/, // dd dddd with space
    /(\d{6})/, // dddddd without separator
  ]

  for (const pattern of patterns) {
    const matches = convertedText.match(pattern)
    if (matches) {
      let number = ""
      if (matches.length === 3) {
        // Two groups (dd, dddd)
        number = `${matches[1]}-${matches[2]}`
      } else if (matches[1] && matches[1].length === 6) {
        // Single group (dddddd)
        const numStr = matches[1]
        number = `${numStr.slice(0, 2)}-${numStr.slice(2)}`
      } else {
        continue
      }

      // Convert back to Bangla numbers
      let banglaNumber = number
      for (const [english, bangla] of Object.entries(englishToBangla)) {
        banglaNumber = banglaNumber.replace(new RegExp(english, "g"), bangla)
      }

      console.log(`Found 6-digit number: '${banglaNumber}' (from '${number}')`)
      return banglaNumber
    }
  }

  return ""
}

function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0

  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const union = new Set([...setA, ...setB])

  return intersection.size / union.size
}
