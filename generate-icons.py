#!/usr/bin/env python3
"""
Generate PNG icons from SVG for Chrome Extension
Requires: pip install cairosvg pillow
"""

try:
    import cairosvg
    from PIL import Image
    import io
    import os

    # Icon sizes required for Chrome Web Store
    sizes = [16, 48, 128]

    svg_file = 'icons/icon.svg'

    print("🎨 Generating icons from SVG...")

    for size in sizes:
        output_file = f'icons/icon{size}.png'

        # Convert SVG to PNG using cairosvg
        png_data = cairosvg.svg2png(
            url=svg_file,
            output_width=size,
            output_height=size
        )

        # Save the PNG
        with open(output_file, 'wb') as f:
            f.write(png_data)

        print(f"✅ Created {output_file}")

    print("\n✨ All icons generated successfully!")
    print("\nYou can now use these icons in your manifest.json")

except ImportError as e:
    print("❌ Missing required packages!")
    print("\nPlease install required packages:")
    print("  pip install cairosvg pillow")
    print("\nOr use an online SVG to PNG converter:")
    print("  1. Open icons/icon.svg in a browser")
    print("  2. Use https://cloudconvert.com/svg-to-png")
    print("  3. Convert to 16x16, 48x48, and 128x128 PNG files")
    print("  4. Save as icon16.png, icon48.png, icon128.png in icons/ folder")
