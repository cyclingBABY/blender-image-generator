"""
Image3D Studio - Blender Automation Worker
Executes headless Blender instance to produce genuine native .blend projects.
"""

import subprocess
import os
import sys

def run_blender_automation(script_path: str, output_blend_path: str, blender_executable: str = "blender"):
    """
    Launches headless Blender:
    blender --background --python <script_path>
    """
    if not os.path.exists(script_path):
        raise FileNotFoundError(f"Script not found at: {script_path}")

    cmd = [
        blender_executable,
        "--background",
        "--factory-startup",
        "--python",
        script_path,
    ]

    print(f"[Blender Worker] Executing command: {' '.join(cmd)}")
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate()

    print("[Blender Worker] STDOUT:\n", stdout)
    if stderr:
        print("[Blender Worker] STDERR:\n", stderr)

    if process.returncode != 0:
        raise RuntimeError(f"Blender process exited with code {process.returncode}")

    if not os.path.exists(output_blend_path):
        print(f"[Blender Worker] Warning: Expected .blend output at {output_blend_path} not found.")

    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python blender_worker.py <import_script.py> <output.blend>")
        sys.exit(1)
    run_blender_automation(sys.argv[1], sys.argv[2])
