#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the Chrome extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with a gradient background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (simplified)
    for y in range(size):
        color = (
            int(102 + (118 - 102) * y / size),  # Red: 102 -> 118
            int(126 + (75 - 126) * y / size),   # Green: 126 -> 75  
            int(234 + (162 - 234) * y / size),  # Blue: 234 -> 162
            255
        )
        draw.line([(0, y), (size, y)], fill=color)
    
    # Draw a simple "F" for FACE
    try:
        # Try to use a system font
        font_size = size // 2
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Draw the "F" letter
    text = "F"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

if __name__ == "__main__":
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        filename = f"icon-{size}.png"
        create_icon(size, filename)
    
    print("All icons created successfully!")