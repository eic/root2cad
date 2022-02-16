import subprocess
import os

# CONFIGURATION

# Geometries to exclude from the conversion
exclude_volumes = ["EcalEndcapP_envelope"]

# File types (extensions) to convert to 
exports = ["obj", "fbx", "stp"]

#
# -------------------------------

# List geometry contents
ls_result = subprocess.run("xvfb-run node index.mjs --ls --ls-depth=1 test/detector_geo_full.root default", shell=True, check=True, capture_output=True)

# Split by new string
names = ls_result.stdout.decode('ascii').split(os.linesep)

# Do a couple of things
# 1. Remove master volume -names[1:] 
# 2. Remove empty lines
# 3. now we have array of something like /world_volume/B0PF_BeamlineMagnet_assembly
#    we need just B0PF_BeamlineMagnet_assembly, since full path corresponds to POSIX file names
# 4. We also exclude volumes
names = [os.path.basename(name) for name in names[1:] if name and name not in exclude_volumes]

# print(names)
for name in names:
    # Output file name
    gltf_file = f"test/{name}.gltf"

    # Run conversion
    subprocess.run(f"xvfb-run node index.mjs test/detector_geo_full.root default {name} -o {gltf_file}", shell=True, check=True)
  
    # Convert to other formats
    for export_name in exports:
        dest_file = f"test/{name}.{export_name}"
        subprocess.run(f"assimp export {gltf_file} {dest_file}", shell=True, check=True)
    