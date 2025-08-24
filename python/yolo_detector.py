import cv2
import numpy as np
import json
import sys
import time
import os
from pathlib import Path

class YOLOLicensePlateDetector:
    def __init__(self, model_path, confidence_threshold=0.5, nms_threshold=0.4):
        """
        Initialize YOLO detector for .pt models
        
        Args:
            model_path: Path to your YOLO .pt model file
            confidence_threshold: Minimum confidence for detections
            nms_threshold: Non-maximum suppression threshold
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.nms_threshold = nms_threshold
        
        # Load YOLOv5/v8 model
        self.model = None
        self._load_model()
        
    def _load_model(self):
        """Load the YOLOv5/v8 .pt model"""
        try:
            import torch
            
            # Check if model file exists
            if not Path(self.model_path).exists():
                raise FileNotFoundError(f"Model file not found: {self.model_path}")
            
            # Load model - suppress output during loading
            print(f"Loading YOLOv5/v8 model from: {self.model_path}", file=sys.stderr)
            
            # Try loading with ultralytics first (YOLOv8)
            try:
                from ultralytics import YOLO
                # Suppress ultralytics output
                os.environ['YOLO_VERBOSE'] = 'False'
                self.model = YOLO(self.model_path)
                self.model.verbose = False  # Disable verbose output
                self.model_type = "ultralytics"
                print("Loaded with Ultralytics (YOLOv8)", file=sys.stderr)
            except ImportError:
                # Fallback to torch.hub for YOLOv5
                self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=self.model_path, force_reload=True)
                self.model_type = "torch_hub"
                print("Loaded with torch.hub (YOLOv5)", file=sys.stderr)
            
            # Set confidence threshold
            if hasattr(self.model, 'conf'):
                self.model.conf = self.confidence_threshold
            
            print(f"Successfully loaded model: {self.model_path}", file=sys.stderr)
            
        except ImportError as e:
            print(f"Error: Missing dependencies for YOLOv5/v8: {e}", file=sys.stderr)
            print("Install with: pip install torch ultralytics", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            sys.exit(1)
    
    def detect_license_plates(self, image_path):
        """
        Detect license plates in image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with detections, processing time, and model info
        """
        start_time = time.time()
        detections = []
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image from: {image_path}")
            
            print(f"Processing image: {image_path}", file=sys.stderr)
            print(f"Image shape: {image.shape}", file=sys.stderr)
            
            # Run inference
            if self.model_type == "ultralytics":
                # Suppress ultralytics output during inference
                results = self.model(image, verbose=False)
                detections = self._process_ultralytics_results(results)
            else:
                results = self.model(image)
                detections = self._process_torch_hub_results(results)
                
        except Exception as e:
            print(f"Detection error: {e}", file=sys.stderr)
            
        processing_time = time.time() - start_time
        
        return {
            'detections': detections,
            'processing_time': round(processing_time, 2),
            'model_version': f'{self.model_type}_license_plate_detector'
        }
    
    def _process_ultralytics_results(self, results):
        """Process Ultralytics YOLO results"""
        detections = []
        
        try:
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        confidence = float(box.conf[0])
                        if confidence > self.confidence_threshold:
                            # Get bounding box coordinates
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            w, h = x2 - x1, y2 - y1
                            
                            detections.append({
                                'bbox': [int(x1), int(y1), int(w), int(h)],
                                'confidence': confidence,
                                'class': 'license_plate'
                            })
                            
                            print(f"Detection: bbox=[{int(x1)}, {int(y1)}, {int(w)}, {int(h)}], conf={confidence:.3f}", file=sys.stderr)
        except Exception as e:
            print(f"Error processing Ultralytics results: {e}", file=sys.stderr)
        
        return detections
    
    def _process_torch_hub_results(self, results):
        """Process torch.hub YOLO results"""
        detections = []
        
        try:
            # Convert to pandas dataframe
            df = results.pandas().xyxy[0]
            
            for _, row in df.iterrows():
                confidence = float(row['confidence'])
                if confidence > self.confidence_threshold:
                    x1, y1, x2, y2 = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])
                    w, h = x2 - x1, y2 - y1
                    
                    detections.append({
                        'bbox': [x1, y1, w, h],
                        'confidence': confidence,
                        'class': 'license_plate'
                    })
                    
                    print(f"Detection: bbox=[{x1}, {y1}, {w}, {h}], conf={confidence:.3f}", file=sys.stderr)
        except Exception as e:
            print(f"Error processing torch.hub results: {e}", file=sys.stderr)
        
        return detections

def main():
    if len(sys.argv) < 2:
        print("Usage: python yolo_detector.py <image_path>", file=sys.stderr)
        sys.exit(1)
    
    # Configuration - UPDATE THIS PATH WITH YOUR .pt MODEL
    MODEL_PATH = "yolo.pt"  # UPDATE THIS PATH
    
    # You can also use environment variables
    MODEL_PATH = os.getenv('YOLO_MODEL_PATH', MODEL_PATH)
    
    try:
        # Get image path from command line
        image_path = sys.argv[1]
        
        # Check if image file exists
        if not Path(image_path).exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Initialize detector
        detector = YOLOLicensePlateDetector(
            model_path=MODEL_PATH,
            confidence_threshold=0.5,
            nms_threshold=0.4
        )
        
        # Detect license plates
        results = detector.detect_license_plates(image_path)
        
        # Output ONLY JSON results to stdout (no debug messages)
        print(json.dumps(results))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'detections': [],
            'processing_time': 0,
            'model_version': 'error'
        }
        # Output error as JSON to stdout
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
