import cv2
import numpy as np
import json
import sys
import time
import re
import os
from pathlib import Path
from difflib import get_close_matches

try:
    import pytesseract
    
    # Windows Tesseract path configuration
    # Try common installation paths for Windows
    possible_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe'.format(os.getenv('USERNAME', '')),
        r'C:\tesseract\tesseract.exe',
    ]
    
    # Check if tesseract is already in PATH
    tesseract_path = None
    try:
        # Try to run tesseract to see if it's in PATH
        import subprocess
        result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("Tesseract found in PATH", file=sys.stderr)
        else:
            raise FileNotFoundError("Tesseract not in PATH")
    except (FileNotFoundError, subprocess.SubprocessError):
        # Tesseract not in PATH, try to find it
        print("Tesseract not found in PATH, searching common locations...", file=sys.stderr)
        
        for path in possible_paths:
            if os.path.exists(path):
                tesseract_path = path
                print(f"Found Tesseract at: {tesseract_path}", file=sys.stderr)
                break
        
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        else:
            print("Tesseract not found in common locations. Please update the path manually.", file=sys.stderr)
            print("Common installation paths checked:", file=sys.stderr)
            for path in possible_paths:
                print(f"  - {path}", file=sys.stderr)
            
            # Manual path override - UPDATE THIS IF NEEDED
            manual_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            if os.path.exists(manual_path):
                pytesseract.pytesseract.tesseract_cmd = manual_path
                print(f"Using manual path: {manual_path}", file=sys.stderr)
            else:
                print(f"Manual path not found: {manual_path}", file=sys.stderr)
                print("Please update the 'manual_path' variable in ocr_extractor.py", file=sys.stderr)

except ImportError:
    print("Error: pytesseract not installed. Install with: pip install pytesseract", file=sys.stderr)
    sys.exit(1)

class BanglaLicensePlateOCR:
    def __init__(self):
        # Test Tesseract installation
        self._test_tesseract()
        
        # Complete list of Bangladesh area names for difflib matching
        self.area_names = [
            # Major cities
            'ঢাকা', 'dhaka', 'DHAKA', 'Dhaka',
            'চট্টগ্রাম', 'chittagong', 'CHITTAGONG', 'Chittagong', 'ctg', 'CTG',
            'সিলেট', 'sylhet', 'SYLHET', 'Sylhet',
            'রাজশাহী', 'rajshahi', 'RAJSHAHI', 'Rajshahi',
            'বরিশাল', 'barisal', 'BARISAL', 'Barisal',
            'খুলনা', 'khulna', 'KHULNA', 'Khulna',
            'রংপুর', 'rangpur', 'RANGPUR', 'Rangpur',
            'ময়মনসিংহ', 'mymensingh', 'MYMENSINGH', 'Mymensingh',
            'কুমিল্লা', 'comilla', 'COMILLA', 'Comilla',
            'নোয়াখালী', 'noakhali', 'NOAKHALI', 'Noakhali',
            'ফেনী', 'feni', 'FENI', 'Feni',
            'লক্ষ্মীপুর', 'lakshmipur', 'LAKSHMIPUR', 'Lakshmipur',
            'ব্রাহ্মণবাড়িয়া', 'brahmanbaria', 'BRAHMANBARIA', 'Brahmanbaria',
            'চাঁদপুর', 'chandpur', 'CHANDPUR', 'Chandpur',
            
            # Metro areas
            'মেট্রো', 'metro', 'METRO', 'Metro',
            
            # Vehicle classes
            'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
            'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ'
        ]
        
        # Bangla to English number mapping
        self.bangla_numbers = {
            '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
            '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        }
        
        # English to Bangla number mapping
        self.english_to_bangla = {v: k for k, v in self.bangla_numbers.items()}
    
    def _test_tesseract(self):
        """Test if Tesseract is working properly"""
        try:
            # Create a simple test image
            test_image = np.ones((50, 200, 3), dtype=np.uint8) * 255
            cv2.putText(test_image, 'TEST', (50, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
            
            # Try to extract text
            test_text = pytesseract.image_to_string(test_image, config='--psm 8')
            print(f"Tesseract test successful. Detected: '{test_text.strip()}'", file=sys.stderr)
            
            # Test Bengali language support
            try:
                test_text_ben = pytesseract.image_to_string(test_image, lang='ben+eng', config='--psm 8')
                print("Bengali language support confirmed", file=sys.stderr)
            except Exception as e:
                print(f"Warning: Bengali language support may not be available: {e}", file=sys.stderr)
                print("You may need to install Bengali language data for Tesseract", file=sys.stderr)
            
        except Exception as e:
            print(f"Tesseract test failed: {e}", file=sys.stderr)
            raise Exception(f"Tesseract is not working properly: {e}")
    
    def preprocess_image(self, image, bbox=None):
        """Preprocess image for better OCR results with enhanced Bangla text recognition"""
        try:
            # Crop image if bounding box provided
            if bbox and len(bbox) == 4:
                x, y, w, h = bbox
                # Ensure coordinates are within image bounds
                height, width = image.shape[:2]
                x = max(0, min(x, width))
                y = max(0, min(y, height))
                w = min(w, width - x)
                h = min(h, height - y)
                
                if w > 0 and h > 0:
                    image = image[y:y+h, x:x+w]
                    print(f"Cropped image to bbox: [{x}, {y}, {w}, {h}]", file=sys.stderr)
            
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Significantly resize image for better OCR (make it much larger)
            height, width = gray.shape
            # Use a larger scale factor for better text recognition
            scale_factor = max(200/height, 600/width, 3.0)  # Increased scale factor
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            gray = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            print(f"Resized image from {width}x{height} to {new_width}x{new_height} (scale: {scale_factor:.2f})", file=sys.stderr)
            
            # Enhanced preprocessing pipeline for Bangla text
            
            # 1. Noise reduction with bilateral filter (preserves edges better)
            denoised = cv2.bilateralFilter(gray, 9, 75, 75)
            
            # 2. Contrast enhancement using CLAHE
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(denoised)
            
            # 3. Multiple thresholding approaches - try different methods
            # Method 1: Adaptive threshold
            binary1 = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 2)
            
            # Method 2: Otsu's thresholding
            _, binary2 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # Method 3: Mean-based threshold
            mean_val = np.mean(enhanced)
            _, binary3 = cv2.threshold(enhanced, mean_val - 20, 255, cv2.THRESH_BINARY)
            
            # Choose the best binary image (one with most reasonable text-like regions)
            binary_images = [binary1, binary2, binary3]
            binary_scores = []
            
            for binary in binary_images:
                # Count connected components (text regions)
                num_labels, labels = cv2.connectedComponents(binary)
                # Prefer images with moderate number of components (not too noisy, not too sparse)
                score = abs(num_labels - 20)  # Target around 20 components for license plate
                binary_scores.append(score)
            
            best_binary_idx = np.argmin(binary_scores)
            binary = binary_images[best_binary_idx]
            print(f"Selected thresholding method {best_binary_idx + 1} (score: {binary_scores[best_binary_idx]})", file=sys.stderr)
            
            # 4. Morphological operations to clean up text
            # Use different kernel sizes for different operations
            kernel_small = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            kernel_medium = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            
            # Close small gaps in characters
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel_small)
            
            # Remove small noise
            binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_small)
            
            # Dilate slightly to make text thicker (helps with OCR)
            binary = cv2.dilate(binary, kernel_small, iterations=1)
            
            # 5. Final cleanup - remove very small or very large components
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary)
            
            # Create a mask for components of reasonable size
            min_area = 50  # Minimum area for a character
            max_area = (new_width * new_height) // 4  # Maximum area (quarter of image)
            
            mask = np.zeros_like(binary)
            for i in range(1, num_labels):  # Skip background (label 0)
                area = stats[i, cv2.CC_STAT_AREA]
                if min_area <= area <= max_area:
                    mask[labels == i] = 255
            
            binary = mask
            
            # 6. Optional: Save debug images for troubleshooting
            # Uncomment these lines to save intermediate processing steps
            # cv2.imwrite('debug_original.jpg', gray)
            # cv2.imwrite('debug_enhanced.jpg', enhanced)
            # cv2.imwrite('debug_binary.jpg', binary)
            
            return binary
            
        except Exception as e:
            print(f"Image preprocessing error: {e}", file=sys.stderr)
            return image
    
    def extract_text_two_line_format(self, image_path, bbox=None):
        """Extract text from Bangladeshi license plate with two-line format using difflib correction"""
        start_time = time.time()
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image from: {image_path}")
            
            print(f"Processing OCR for two-line license plate: {image_path}", file=sys.stderr)
            if bbox:
                print(f"Using bounding box: {bbox}", file=sys.stderr)
            
            # Preprocess image
            processed_image = self.preprocess_image(image, bbox)
            
            # Try multiple OCR configurations optimized for two-line text
            ocr_configs = [
                # Config 1: PSM 4 - Single column of text of variable sizes
                {'config': r'--oem 3 --psm 4 -l ben+eng', 'name': 'Bengali+English PSM4 (Column)'},
                
                # Config 2: PSM 6 - Uniform block of text
                {'config': r'--oem 3 --psm 6 -l ben+eng', 'name': 'Bengali+English PSM6 (Block)'},
                
                # Config 3: PSM 3 - Fully automatic page segmentation
                {'config': r'--oem 3 --psm 3 -l ben+eng', 'name': 'Bengali+English PSM3 (Auto)'},
                
                # Config 4: PSM 11 - Sparse text
                {'config': r'--oem 3 --psm 11 -l ben+eng', 'name': 'Bengali+English PSM11 (Sparse)'},
                
                # Config 5: Bengali only
                {'config': r'--oem 3 --psm 4 -l ben', 'name': 'Bengali-only PSM4'},
                
                # Config 6: English fallback
                {'config': r'--oem 3 --psm 4 -l eng', 'name': 'English-only PSM4'},
            ]
            
            best_result = None
            best_score = 0
            
            for config_info in ocr_configs:
                try:
                    config = config_info['config']
                    config_name = config_info['name']
                    
                    print(f"Trying OCR config: {config_name}", file=sys.stderr)
                    
                    # Extract text
                    extracted_text = pytesseract.image_to_string(processed_image, config=config)
                    extracted_text = extracted_text.strip()
                    
                    if not extracted_text:
                        print(f"  No text extracted with {config_name}", file=sys.stderr)
                        continue
                    
                    print(f"  Raw extracted text: '{extracted_text}'", file=sys.stderr)
                    
                    # Parse the two-line format
                    parsed_result = self.parse_two_line_license_plate(extracted_text)
                    
                    if parsed_result['success']:
                        # Get confidence score
                        try:
                            data = pytesseract.image_to_data(processed_image, config=config, output_type=pytesseract.Output.DICT)
                            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                            confidence = avg_confidence / 100.0
                        except:
                            confidence = 0.5
                        
                        # Calculate result score
                        result_score = confidence
                        
                        # Bonus for complete license plate
                        if parsed_result['license_plate']:
                            result_score += 0.4
                        
                        # Bonus for finding area name
                        if parsed_result['area_name']:
                            result_score += 0.2
                        
                        # Bonus for finding 6-digit number
                        if parsed_result['number'] and len(parsed_result['number'].replace('-', '')) == 6:
                            result_score += 0.3
                        
                        print(f"  Parsed result: {parsed_result}", file=sys.stderr)
                        print(f"  Score: {result_score:.3f}", file=sys.stderr)
                        
                        if result_score > best_score:
                            best_score = result_score
                            best_result = {
                                'extracted_text': extracted_text,
                                'area_name': parsed_result['area_name'],
                                'vehicle_class': parsed_result['vehicle_class'],
                                'number': parsed_result['number'],
                                'license_plate': parsed_result['license_plate'],
                                'confidence': confidence,
                                'config_used': config_name
                            }
                            print(f"  New best result with score: {result_score:.3f}", file=sys.stderr)
                    
                except Exception as e:
                    print(f"  Config {config_name} failed: {e}", file=sys.stderr)
                    continue
            
            processing_time = time.time() - start_time
            
            if best_result:
                print(f"Final result using {best_result['config_used']}:", file=sys.stderr)
                print(f"  Area: '{best_result['area_name']}'", file=sys.stderr)
                print(f"  Class: '{best_result['vehicle_class']}'", file=sys.stderr)
                print(f"  Number: '{best_result['number']}'", file=sys.stderr)
                print(f"  License Plate: '{best_result['license_plate']}'", file=sys.stderr)
                
                return {
                    'success': True,
                    'extracted_text': best_result['extracted_text'],
                    'license_plate': best_result['license_plate'],
                    'area_name': best_result['area_name'],
                    'vehicle_class': best_result['vehicle_class'],
                    'number': best_result['number'],
                    'confidence': round(best_result['confidence'], 3),
                    'processing_time': round(processing_time, 2),
                    'config_used': best_result['config_used']
                }
            else:
                print("No valid license plate found with any configuration", file=sys.stderr)
                return {
                    'success': False,
                    'error': 'No valid license plate pattern found',
                    'extracted_text': '',
                    'license_plate': '',
                    'confidence': 0.0,
                    'processing_time': round(processing_time, 2)
                }
                
        except Exception as e:
            processing_time = time.time() - start_time
            print(f"OCR extraction error: {e}", file=sys.stderr)
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'license_plate': '',
                'confidence': 0.0,
                'processing_time': round(processing_time, 2)
            }
    
    def parse_two_line_license_plate(self, text):
        """Parse Bangladeshi two-line license plate format using difflib for area name correction"""
        try:
            # Clean and split text into lines
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            print(f"Parsing lines: {lines}", file=sys.stderr)
            
            if len(lines) < 2:
                # Try to split by common separators if only one line detected
                combined_text = ' '.join(lines)
                # Try different splitting strategies
                possible_splits = [
                    combined_text.split(),
                    re.split(r'[,\s]+', combined_text),
                    re.split(r'[-\s]+', combined_text)
                ]
                
                for split_attempt in possible_splits:
                    if len(split_attempt) >= 3:  # Need at least area, class, number
                        lines = split_attempt
                        break
            
            if len(lines) < 2:
                print("Could not identify two lines or sufficient components", file=sys.stderr)
                return {'success': False}
            
            # Line 1: Area name and vehicle class
            line1 = lines[0]
            # Line 2: 6-digit number in format dd-dddd
            line2 = lines[1] if len(lines) > 1 else ''
            
            # Extract area name using difflib
            area_name = self.extract_area_name_with_difflib(line1)
            
            # Extract vehicle class (Bangla letter)
            vehicle_class = self.extract_vehicle_class(line1)
            
            # Extract 6-digit number
            number = self.extract_six_digit_number(line2 if line2 else line1)
            
            # If we didn't find number in line2, try line1
            if not number and len(lines) > 1:
                number = self.extract_six_digit_number(line1)
            
            # Try to find number in any remaining lines
            if not number and len(lines) > 2:
                for line in lines[2:]:
                    number = self.extract_six_digit_number(line)
                    if number:
                        break
            
            print(f"Extracted components - Area: '{area_name}', Class: '{vehicle_class}', Number: '{number}'", file=sys.stderr)
            
            # Construct license plate
            license_plate = ''
            if area_name and vehicle_class and number:
                license_plate = f"{area_name}-{vehicle_class}-{number}"
            elif area_name and number:
                license_plate = f"{area_name}-{number}"
            
            return {
                'success': bool(area_name or vehicle_class or number),
                'area_name': area_name,
                'vehicle_class': vehicle_class,
                'number': number,
                'license_plate': license_plate
            }
            
        except Exception as e:
            print(f"Two-line parsing error: {e}", file=sys.stderr)
            return {'success': False}
    
    def extract_area_name_with_difflib(self, text):
        """Extract area name using difflib for fuzzy matching"""
        try:
            # Clean text and get individual words
            words = re.findall(r'[^\s\-,]+', text)
            
            best_match = ''
            best_ratio = 0
            
            for word in words:
                if len(word) < 2:  # Skip very short words
                    continue
                
                # Use difflib to find closest matches
                matches = get_close_matches(word, self.area_names, n=3, cutoff=0.6)
                
                if matches:
                    # Get the best match
                    match = matches[0]
                    
                    # Calculate similarity ratio
                    from difflib import SequenceMatcher
                    ratio = SequenceMatcher(None, word.lower(), match.lower()).ratio()
                    
                    print(f"  Word '{word}' matched to '{match}' with ratio {ratio:.3f}", file=sys.stderr)
                    
                    if ratio > best_ratio:
                        best_ratio = ratio
                        # Convert to Bangla if it's an English match
                        if match in ['dhaka', 'DHAKA', 'Dhaka']:
                            best_match = 'ঢাকা'
                        elif match in ['chittagong', 'CHITTAGONG', 'Chittagong', 'ctg', 'CTG']:
                            best_match = 'চট্টগ্রাম'
                        elif match in ['sylhet', 'SYLHET', 'Sylhet']:
                            best_match = 'সিলেট'
                        elif match in ['rajshahi', 'RAJSHAHI', 'Rajshahi']:
                            best_match = 'রাজশাহী'
                        elif match in ['barisal', 'BARISAL', 'Barisal']:
                            best_match = 'বরিশাল'
                        elif match in ['khulna', 'KHULNA', 'Khulna']:
                            best_match = 'খুলনা'
                        elif match in ['rangpur', 'RANGPUR', 'Rangpur']:
                            best_match = 'রংপুর'
                        elif match in ['mymensingh', 'MYMENSINGH', 'Mymensingh']:
                            best_match = 'ময়মনসিংহ'
                        elif match in ['metro', 'METRO', 'Metro']:
                            best_match = 'মেট্রো'
                        else:
                            best_match = match
            
            print(f"Best area name match: '{best_match}' with ratio {best_ratio:.3f}", file=sys.stderr)
            return best_match if best_ratio > 0.6 else ''
            
        except Exception as e:
            print(f"Area name extraction error: {e}", file=sys.stderr)
            return ''
    
    def extract_vehicle_class(self, text):
        """Extract vehicle class (Bangla letter)"""
        try:
            # Look for Bangla letters
            bangla_letters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ',
                             'ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ']
            
            for letter in bangla_letters:
                if letter in text:
                    print(f"Found vehicle class: '{letter}'", file=sys.stderr)
                    return letter
            
            return ''
            
        except Exception as e:
            print(f"Vehicle class extraction error: {e}", file=sys.stderr)
            return ''
    
    def extract_six_digit_number(self, text):
        """Extract 6-digit number in format dd-dddd"""
        try:
            # Convert any Bangla numbers to English
            converted_text = text
            for bangla, english in self.bangla_numbers.items():
                converted_text = converted_text.replace(bangla, english)
            
            # Look for 6-digit patterns
            patterns = [
                r'(\d{2})-(\d{4})',  # dd-dddd format
                r'(\d{2})\s*-\s*(\d{4})',  # dd - dddd with spaces
                r'(\d{2})\s+(\d{4})',  # dd dddd with space
                r'(\d{6})',  # dddddd without separator
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, converted_text)
                if matches:
                    if len(matches[0]) == 2:  # Two groups (dd, dddd)
                        number = f"{matches[0][0]}-{matches[0][1]}"
                    else:  # Single group (dddddd)
                        num_str = matches[0]
                        if len(num_str) == 6:
                            number = f"{num_str[:2]}-{num_str[2:]}"
                        else:
                            continue
                    
                    # Convert back to Bangla numbers
                    bangla_number = number
                    for english, bangla in self.english_to_bangla.items():
                        bangla_number = bangla_number.replace(english, bangla)
                    
                    print(f"Found 6-digit number: '{bangla_number}' (from '{number}')", file=sys.stderr)
                    return bangla_number
            
            return ''
            
        except Exception as e:
            print(f"Number extraction error: {e}", file=sys.stderr)
            return ''
    
    # Keep the old method as fallback
    def extract_text(self, image_path, bbox=None):
        """Main extraction method - uses two-line format extraction"""
        return self.extract_text_two_line_format(image_path, bbox)

def main():
    if len(sys.argv) < 2:
        print("Usage: python ocr_extractor.py <image_path> [bbox_json]", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Get image path from command line
        image_path = sys.argv[1]
        
        # Get bounding box if provided
        bbox = None
        if len(sys.argv) > 2:
            bbox_json = sys.argv[2]
            bbox = json.loads(bbox_json)
        
        # Check if image file exists
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Initialize OCR
        ocr = BanglaLicensePlateOCR()
        
        # Extract text using two-line format
        results = ocr.extract_text(image_path, bbox)
        
        # Output ONLY JSON results to stdout (no debug messages)
        print(json.dumps(results))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'extracted_text': '',
            'license_plate': '',
            'confidence': 0.0,
            'processing_time': 0
        }
        # Output error as JSON to stdout
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
