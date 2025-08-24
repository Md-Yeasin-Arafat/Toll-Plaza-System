# Automatic Toll Plaza System Setup Guide

This guide will help you set up and run the Automatic Toll Plaza System with your pre-trained YOLO model.

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS version recommended)
*   Python 3.8+ with pip
*   npm or Yarn (npm is used in this guide's commands)
*   A Google Cloud Platform (GCP) project
*   A Google AI Studio API Key

## Step 1: Clone the Repository

If you haven't already, clone the project repository:

\`\`\`bash
git clone <repository-url>
cd toll-plaza-system
\`\`\`

## Step 2: Install Node.js Dependencies

Install the necessary Node.js dependencies:

\`\`\`bash
npm install
# or yarn install
# or pnpm install
\`\`\`

## Step 3: Install Python Dependencies

Install Python dependencies for YOLO and OCR:

\`\`\`bash
# Navigate to python directory and install requirements
cd python
pip install -r requirements.txt

# Or use the npm script
npm run setup-python
\`\`\`

### Python Dependencies Installed:
- `opencv-python` - For image processing
- `numpy` - For numerical operations
- `torch` & `torchvision` - For PyTorch-based YOLO models
- `ultralytics` - For YOLOv5/v8 models
- `onnxruntime` - For ONNX models
- `pytesseract` - For OCR text extraction
- `Pillow` - For image handling

## Step 4: Install Tesseract OCR

### Windows:
1. Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and note the installation path
3. Update the path in `python/ocr_extractor.py` if needed:
   \`\`\`python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   \`\`\`

### macOS:
\`\`\`bash
brew install tesseract
\`\`\`

### Ubuntu/Debian:
\`\`\`bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-ben
\`\`\`

## Step 5: Configure Your YOLO Model

**IMPORTANT: Update the model paths in `python/yolo_detector.py`**

Open `python/yolo_detector.py` and update these lines:

\`\`\`python
# Configuration - UPDATE THESE PATHS WITH YOUR MODEL
MODEL_PATH = "path/to/your/model.weights"  # UPDATE THIS PATH
CONFIG_PATH = "path/to/your/config.cfg"    # UPDATE THIS PATH (for Darknet models)
\`\`\`

### For Different YOLO Versions:

**YOLOv3/v4 (Darknet):**
\`\`\`python
MODEL_PATH = "models/yolov4-license-plate.weights"
CONFIG_PATH = "models/yolov4-license-plate.cfg"
\`\`\`

**YOLOv5/v8 (PyTorch):**
\`\`\`python
MODEL_PATH = "models/license-plate-yolov5.pt"
CONFIG_PATH = None  # Not needed for PyTorch models
\`\`\`

**ONNX Models:**
\`\`\`python
MODEL_PATH = "models/license-plate.onnx"
CONFIG_PATH = None  # Not needed for ONNX models
\`\`\`

## Step 6: Configure Environment Variables (Optional)

Create a `.env.local` file in the root directory:

\`\`\`
# YOLO Model Configuration
YOLO_MODEL_PATH=path/to/your/model.weights
YOLO_CONFIG_PATH=path/to/your/config.cfg

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Google Cloud Configuration
GOOGLE_CLOUD_API_KEY=YOUR_GOOGLE_CLOUD_VISION_API_KEY
GOOGLE_API_KEY=YOUR_GOOGLE_AI_STUDIO_API_KEY
\`\`\`

**Important:**

*   Replace `YOUR_GOOGLE_CLOUD_VISION_API_KEY` with your actual API key from Google Cloud Platform.
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Navigate to "APIs & Services" > "Credentials".
    *   Create a new API key or use an existing one.
    *   Ensure the "Cloud Vision API" is enabled for your project. You can enable it under "APIs & Services" > "Enabled APIs & Services".
    *   Make sure billing is enabled for your Google Cloud project, as the Vision API is a paid service.
*   Replace `YOUR_GOOGLE_AI_STUDIO_API_KEY` with your actual API key from Google AI Studio.
    *   Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a new API key.

## Step 7: Test Python Scripts

Test your YOLO model setup:

\`\`\`bash
# Test YOLO detection (replace with actual base64 image)
cd python
python yolo_detector.py "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

# Test OCR extraction
python ocr_extractor.py "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
\`\`\`

## Step 8: Run the Development Server

Start the Next.js development server:

\`\`\`bash
npm run dev
# or yarn dev
# or pnpm dev
\`\`\`

The application will be accessible at `http://localhost:3000`.

## Step 9: Test the System

### License Plate Detection with Your YOLO Model

1. Navigate to `http://localhost:3000/dashboard/detection`.
2. Upload an image containing a Bangla license plate.
3. The system will:
   - Use your YOLO model to detect license plate regions
   - Use OCR to extract text from detected regions
   - Parse and format the Bangla license plate

### Payment Gateway (Sandbox)

1. **Access via Sidebar:**
    *   Click on the new "Payment Gateway" link in the sidebar. This will take you to a demo payment page (`/payment/demo-vehicle-id?amount=10.00`) for quick testing.
2. **Access via Processing Page (Simulated Email Link):**
    *   Navigate to `http://localhost:3000/dashboard/processing`.
    *   Locate a vehicle with "Pending Payment" status (e.g., the "ঢাকা-মেট্রো-গ-১২-৩৪৫৬" entry).
    *   Click the "Send Payment Link" button next to it.
    *   A toast notification will appear, indicating the link has been "sent".
    *   **Check your server console (where you ran `npm run dev`)**: You will see a log message containing the simulated payment link. Copy this link.
    *   Open the copied payment link in your browser.
3. **On the Payment Page:**
    *   You will see a form to enter card details.
    *   **For a successful payment:** Enter a card number ending in `0000` (e.g., `4111 1111 1111 0000`).
    *   **For a failed payment:** Enter any other card number.
    *   Observe the success or failure message on the payment page.

## Troubleshooting

*   **`GOOGLE_CLOUD_API_KEY is set to placeholder value` error:** Ensure you have replaced `YOUR_GOOGLE_CLOUD_VISION_API_KEY` in `.env.local` with a valid key and restarted your development server.
*   **`Failed to execute 'json' on 'Response'` or API errors:**
    *   Double-check your `GOOGLE_CLOUD_API_KEY` and `GOOGLE_API_KEY` in `.env.local`.
    *   Ensure the Google Cloud Vision API is enabled in your GCP project.
    *   Verify that billing is enabled for your Google Cloud project.
    *   Review your server console for any error messages from the API routes.
*   **Payment link not appearing in console:** Ensure your `app/dashboard/processing/page.tsx` is correctly updated and your server is running.

### Python Script Errors:
- **"Python script not found"**: Ensure the `python/` directory exists with the scripts
- **"Module not found"**: Run `pip install -r python/requirements.txt`
- **"Could not load model"**: Check your model paths in `yolo_detector.py`

### YOLO Model Issues:
- **"Error loading model"**: Verify your model file exists and is compatible
- **"No detections"**: Your model might need different confidence thresholds
- **"CUDA errors"**: Install GPU-compatible PyTorch if using GPU

### OCR Issues:
- **"Tesseract not found"**: Install Tesseract OCR and update the path
- **"Poor text recognition"**: The image preprocessing might need adjustment

### Performance Tips:
- Use GPU-accelerated PyTorch for faster YOLO inference
- Adjust confidence thresholds in `yolo_detector.py`
- Optimize image preprocessing in `ocr_extractor.py`

## Model Compatibility

The system supports:
- **YOLOv3/v4** (Darknet format): `.weights` + `.cfg` files
- **YOLOv5/v8** (PyTorch format): `.pt` files
- **ONNX models**: `.onnx` files

## Next Steps

1. **Update model paths** in `python/yolo_detector.py`
2. **Test with your images** to verify detection accuracy
3. **Adjust confidence thresholds** if needed
4. **Customize OCR preprocessing** for better text extraction

Your system is now ready to detect real license plates using your pre-trained YOLO model!
