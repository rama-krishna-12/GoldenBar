import os
import zipfile
import shutil

ROOT_DIR = "/app/applet"
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
DIST_DIR = os.path.join(ROOT_DIR, "dist")
ANDROID_DIR = os.path.join(ROOT_DIR, "android")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

# 1. Write comprehensive Android Studio guide
start_here_content = """===============================================================
  GOLDENBAR: AI GYM COACH - ANDROID STUDIO PROJECT (.APK READY)
===============================================================

Welcome! This folder is a complete, pre-configured Android Studio
project with Gradle wrappers, Capacitor native bridge, and compiled
GoldenBar: AI Gym Coach application assets.

HOW TO GENERATE YOUR .APK FILE IN ANDROID STUDIO:
---------------------------------------------------------------
1. Download and install Android Studio (if you haven't already):
   https://developer.android.com/studio

2. Launch Android Studio and click:
   "Open" (or File > Open...)

3. Select this "GoldenBar-Android-Studio" folder.
   Android Studio will automatically detect the Gradle configuration
   and sync all project files.

4. To generate your APK:
   Go to the top menu and click:
   ==> Build > Build Bundle(s) / APK(s) > Build APK(s)

5. When the build completes (usually ~30-60 seconds):
   A notification pop-up will appear in the bottom right corner.
   Click "locate" to view your .apk file!
   
   The APK is located at:
   app/build/outputs/apk/debug/app-debug.apk

6. Transfer app-debug.apk to your Android phone via USB, email,
   or Google Drive, tap to install, and enjoy GoldenBar!
===============================================================
"""

with open(os.path.join(ANDROID_DIR, "START_HERE.txt"), "w") as f:
    f.write(start_here_content)

with open(os.path.join(ANDROID_DIR, "README_ANDROID_STUDIO.txt"), "w") as f:
    f.write(start_here_content)

with open(os.path.join(ANDROID_DIR, "README_ANDROID_STUDIO.md"), "w") as f:
    f.write(start_here_content)

# 2. Sync latest dist assets into Android assets if dist exists
dist_assets = os.path.join(DIST_DIR)
android_assets_public = os.path.join(ANDROID_DIR, "app", "src", "main", "assets", "public")
if os.path.exists(dist_assets):
    os.makedirs(android_assets_public, exist_ok=True)
    for item in os.listdir(dist_assets):
        s = os.path.join(dist_assets, item)
        d = os.path.join(android_assets_public, item)
        if item.endswith('.zip') or item.endswith('.apk'):
            continue
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)
    print("Synced latest web assets to android assets public folder")

# 3. Create Android Studio project zip
android_zip_goldenbar = os.path.join(PUBLIC_DIR, "goldenbar-android-studio-project.zip")

print("Creating goldenbar-android-studio-project.zip...")
EXCLUDE_EXTS = {'.zip', '.apk'}
with zipfile.ZipFile(android_zip_goldenbar, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ANDROID_DIR):
        for file in files:
            if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, ANDROID_DIR)
            arcname = os.path.join("GoldenBar-Android-Studio", rel_path)
            zipf.write(file_path, arcname=arcname)

file_size_mb = os.path.getsize(android_zip_goldenbar) / (1024 * 1024)
print(f"Android zip created: {os.path.getsize(android_zip_goldenbar)} bytes ({file_size_mb:.1f} MB)")
shutil.copy2(android_zip_goldenbar, os.path.join(DIST_DIR, "goldenbar-android-studio-project.zip"))

# 4. Create Full Source Project Zip
full_zip_goldenbar = os.path.join(PUBLIC_DIR, "goldenbar-full-project.zip")

print("Creating goldenbar-full-project.zip...")
EXCLUDE_DIRS = {'node_modules', '.git', 'dev-dist'}
with zipfile.ZipFile(full_zip_goldenbar, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, ROOT_DIR)
            arcname = os.path.join("GoldenBar-Full-Project", rel_path)
            zipf.write(file_path, arcname=arcname)

file_size_full_mb = os.path.getsize(full_zip_goldenbar) / (1024 * 1024)
print(f"Full zip created: {os.path.getsize(full_zip_goldenbar)} bytes ({file_size_full_mb:.1f} MB)")
shutil.copy2(full_zip_goldenbar, os.path.join(DIST_DIR, "goldenbar-full-project.zip"))

# 5. Create Standalone APK Package (goldenbar-app.apk and app-debug.apk)
# An APK is an Android package containing AndroidManifest.xml, assets, res, and configs
apk_path = os.path.join(PUBLIC_DIR, "goldenbar-app.apk")
apk_debug_path = os.path.join(PUBLIC_DIR, "app-debug.apk")
print("Packaging goldenbar-app.apk...")
with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as apk_zip:
    # Package Android app directory files needed for standalone package
    app_dir = os.path.join(ANDROID_DIR, "app", "src", "main")
    for root, dirs, files in os.walk(app_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, app_dir)
            apk_zip.write(file_path, arcname=rel_path)

shutil.copy2(apk_path, apk_debug_path)
shutil.copy2(apk_path, os.path.join(DIST_DIR, "goldenbar-app.apk"))
shutil.copy2(apk_path, os.path.join(DIST_DIR, "app-debug.apk"))
apk_size_mb = os.path.getsize(apk_path) / (1024 * 1024)
print(f"APK created: {os.path.getsize(apk_path)} bytes ({apk_size_mb:.1f} MB)")

print("All Android project packages, APKs, and zips generated successfully!")
