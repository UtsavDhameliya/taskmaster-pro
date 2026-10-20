import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

SLIDES = [
    {
        "file": "01_Landing_Hero_Light.png",
        "badge": "FRONTEND & UI/UX",
        "title": "TaskMaster Pro — Modern Landing Page",
        "desc": "Built with React 19, Tailwind CSS & Vite with instant responsiveness",
    },
    {
        "file": "02_Landing_Hero_Dark.png",
        "badge": "SEAMLESS THEMES",
        "title": "Dark Mode & Glassmorphic Accents",
        "desc": "System-matched color schemes with persistent user preference storage",
    },
    {
        "file": "03_Dashboard_Tasks_Dark.png",
        "badge": "CORE WORKFLOW",
        "title": "Productivity Dashboard & KPI Metrics",
        "desc": "Real-time task counters, completion percentage bar & micro-interactions",
    },
    {
        "file": "04_Dashboard_Tasks_Light.png",
        "badge": "ORGANIZATION",
        "title": "Task Filtering, Search & Priority Sort",
        "desc": "Instant multi-field queries, status tabs and priority color badges",
    },
    {
        "file": "05_Task_Creation_Modal.png",
        "badge": "INTERACTIVE UX",
        "title": "Rich Task Creation & Due Date Presets",
        "desc": "Fast scheduling with Today, Tomorrow, and Next Week shortcuts",
    },
    {
        "file": "06_Trash_And_Recovery_Drawer.png",
        "badge": "DATA INTEGRITY",
        "title": "Soft-Delete Trash & Recovery Engine",
        "desc": "Prevents accidental data loss with 1-click restore or permanent purge",
    },
    {
        "file": "07_Admin_Console_User_Directory.png",
        "badge": "ENTERPRISE RBAC",
        "title": "Admin Console & Global User Directory",
        "desc": "Manage user roles, verify account statuses & monitor platform health",
    },
    {
        "file": "08_Admin_Console_Global_Tasks.png",
        "badge": "SCALABILITY",
        "title": "Platform-Wide Task Oversight",
        "desc": "Multi-tenant inspection of all user workflows with admin moderation",
    },
    {
        "file": "09_User_Profile_And_Security.png",
        "badge": "SECURITY & AUTH",
        "title": "JWT Auth & Email OTP Verification",
        "desc": "Bcrypt password hashing, SMTP OTP delivery & secure profile settings",
    },
]

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "contra_assets")
MP4_OUT = os.path.join(ASSETS_DIR, "taskmaster_pro_showcase.mp4")
GIF_OUT = os.path.join(ASSETS_DIR, "taskmaster_pro_preview.gif")

TARGET_W, TARGET_H = 1280, 720
FPS = 15  # Efficient frame rate
SLIDE_DURATION_SEC = 2.2
TRANSITION_DURATION_SEC = 0.4

SLIDE_FRAMES = int(SLIDE_DURATION_SEC * FPS)
FADE_FRAMES = int(TRANSITION_DURATION_SEC * FPS)


def get_font(size, bold=False):
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for fn in font_names:
        if os.path.exists(fn):
            try:
                return ImageFont.truetype(fn, size)
            except Exception:
                pass
    return ImageFont.load_default()


def render_slide_image(slide_info):
    img_path = os.path.join(ASSETS_DIR, slide_info["file"])
    base_img = Image.new("RGB", (TARGET_W, TARGET_H), (15, 23, 42))

    if os.path.exists(img_path):
        orig = Image.open(img_path).convert("RGB")
        orig_w, orig_h = orig.size
        scale = min(TARGET_W / orig_w, (TARGET_H - 90) / orig_h)
        new_w, new_h = int(orig_w * scale), int(orig_h * scale)
        resized = orig.resize((new_w, new_h), Image.Resampling.LANCZOS)
        x_offset = (TARGET_W - new_w) // 2
        y_offset = (TARGET_H - 90 - new_h) // 2 + 5
        base_img.paste(resized, (x_offset, y_offset))

    # Lower-third banner
    draw = ImageDraw.Draw(base_img, "RGBA")
    banner_y = TARGET_H - 85
    draw.rectangle([(0, banner_y), (TARGET_W, TARGET_H)], fill=(10, 15, 30, 245))
    draw.line([(0, banner_y), (TARGET_W, banner_y)], fill=(99, 102, 241, 255), width=2)

    font_badge = get_font(13, bold=True)
    font_title = get_font(22, bold=True)
    font_desc = get_font(15, bold=False)

    # Badge
    draw.rounded_rectangle(
        [(30, banner_y + 14), (200, banner_y + 38)],
        radius=5,
        fill=(99, 102, 241, 60),
        outline=(129, 140, 248, 220),
        width=1,
    )
    draw.text((40, banner_y + 18), slide_info["badge"], font=font_badge, fill=(165, 180, 252))

    # Title & Subtitle
    draw.text((220, banner_y + 12), slide_info["title"], font=font_title, fill=(255, 255, 255))
    draw.text((220, banner_y + 46), slide_info["desc"], font=font_desc, fill=(148, 163, 184))

    return base_img


def main():
    print("Pre-rendering slides...")
    slide_images = [render_slide_image(s) for s in SLIDES]
    slide_arrays = [np.array(img) for img in slide_images]

    print(f"Creating animated GIF preview: {GIF_OUT}...")
    gif_frames = []
    for img in slide_images:
        resized_gif = img.resize((720, 405), Image.Resampling.BILINEAR)
        # Duplicate for duration
        for _ in range(6):  # 6 * 300ms = 1.8s per slide
            gif_frames.append(resized_gif)

    gif_frames[0].save(
        GIF_OUT,
        save_all=True,
        append_images=gif_frames[1:],
        duration=300,
        loop=0,
        optimize=True,
    )
    print("Animated GIF created successfully!")

    print(f"Streaming MP4 video to {MP4_OUT} ({len(SLIDES)} slides, {FPS} FPS)...")
    ffmpeg_exe = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "to_do",
        "venv",
        "Lib",
        "site-packages",
        "imageio_ffmpeg",
        "binaries",
        "ffmpeg-win-x86_64-v7.1.exe",
    )

    # Run ffmpeg with ultrafast preset to use minimal RAM
    import subprocess
    cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{TARGET_W}x{TARGET_H}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-an",
        "-vcodec", "libx264",
        "-preset", "ultrafast",
        "-tune", "stillimage",
        "-pix_fmt", "yuv420p",
        "-crf", "22",
        MP4_OUT,
    ]

    p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    solid_count = SLIDE_FRAMES - FADE_FRAMES
    for i in range(len(slide_images)):
        curr_img = slide_images[i]
        next_img = slide_images[(i + 1) % len(slide_images)]
        curr_bytes = curr_img.tobytes()

        # Solid frames
        for _ in range(solid_count):
            p.stdin.write(curr_bytes)

        # Fade frames
        if i < len(slide_images) - 1:
            for f in range(FADE_FRAMES):
                alpha = f / float(FADE_FRAMES)
                blended = Image.blend(curr_img, next_img, alpha)
                p.stdin.write(blended.tobytes())
        else:
            for _ in range(FADE_FRAMES):
                p.stdin.write(curr_bytes)

    p.stdin.close()
    p.wait()
    print("MP4 video created successfully!")
    print("ALL DONE!")


if __name__ == "__main__":
    main()
