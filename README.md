# root2cad
CERN ROOT geometry converter to CAD format (GLTF)

<img src="https://github.com/eic/root2cad/blob/main/doc/drich_wireframe_600px-w.png" style="width:300px"/>

## Quick start

```bash

npm install -g root2cad

# For drich.root that has DRICH geometry object saved to it
xvfb-run root2cad drich.root DRICH -o drich2.gltf

# EIC ATHENA latest full detector geometry. Look files here: 
# https://eicweb.phy.anl.gov/EIC/detectors/athena/-/jobs/artifacts/master/browse/geo?job=report
xvfb-run root2cad  detector_geo_full.root default -o detector_geo_full.gltf

# Convert from gdml (CERN ROOT has to be installed)
root -e 'TGeoManager::Import("my.gdml")->Export("my.root")'
xvfb-run root2cad  my.root default -o my.gltf

# Convert to other cad formats
assimp export drich.gltf drich.obj

# list file contents
xvfb-run root2cad --ls detector_geo_full.root

# list geometry hierarchy
xvfb-run root2cad --ls --ls-depth=1 detector_geo_full.root default

# this will output something like
# ...
# 1    /world_volume/DRICH
# ...

# Convert subdetector DRICH
xvfb-run root2cad detector_geo_full.root default DRICH -o drich.gltf
```

## Installation

**Prerequesties:**

- One needs nodejs>13 and npm installed [Installation instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm)
- xvfb (X virtual framebuffer). For Ubuntu: `sudo apt-get install xvfb`

**NPM install**

```
npm install -g root2cad
```

If npm bin paths are set correctly you should have `root2cad` command working. 


## Usage

**root2cad** can convert ROOT geometry objects saved in root file to GLTF format. 
The conversion works for compound and tasselated geometry. 

```
Usage: root2cad [options] [file] [object] [volname]

Arguments:
  file         [required] File name to open (CERN ROOT files)
  object       [required] Geometry object name in ROOT file to open
  volname      [optional] Volume name in geometry hierarchy

Options:
  -o, --output <string>  Output file name. "exported.gltf" if not set
  --ls                   Lists all objects in file or geometry (same as --ls-vol)
  --ls-vol               Lists geometry hierarchy of VOLUME names. See also --list-depth
  --ls-node              Lists geometry hierarchy of NODE names. See also --list-depth
  --ls-depth <int>       Works with --list, defines the level to print. Default 0
  -V, --version          output the version number
  -h, --help             display help for command
```

Examples: 

```
# For drich.root that has DRICH geometry object saved to it
xvfb-run root2cad drich.root DRICH -o drich2.gltf

# List objects in file (for convenietnce)
xvfb-run root2cad  --ls drich.root

# List geometry hierarchy
xvfb-run root2cad  --ls drich.root DRICH
xvfb-run root2cad  --ls --ls-depth=5 drich.root DRICH

```

Use [**GLTF VIEWER online**](https://gltf.insimo.com/) to see the results!


### GDML conversion

To convert GDML one can convert it to ROOT with this one liner:

```bash
root -e 'TGeoManager::Import("drich.gdml")->Export("drich.root")'
xvfb-run node export.mjs drich.root default -o drich.gltf
```

During this conversion, the saved object is named **'default'**
thus we use it to convert the resulting root geometry


### Individual volumes conversion

One can provide a volume name to export only this volume. So one has to specify file name, 
geometry object name inside file and volume name inside the geometry. There is `--ls` command
that helps to see detector hierarchy and volume names.

```bash
# list geometry hierarchy
xvfb-run root2cad --ls --ls-depth=1 detector_geo_full.root default

# this will output something like
# ...
# 1    /world_volume/DRICH
# ...

# Convert subdetector DRICH
xvfb-run root2cad detector_geo_full.root default DRICH -o drich.gltf
```

Using `--ls` and volume names could be used to automatically split DD4HEP geometry hierarchy to 
components in gftl format. See [**auto_split_example.py**](auto_split_example.py) for example (files in test folder)


### Other formats

[glTF (GL Transmission Format)](https://www.khronos.org/gltf/) is a 3D file format that stores 3D model information in JSON format.
It is common for web 3d graphics but not all CAD software can work with it. Free options to 
convert from GLTF to other formats: 

- assimp (Asset Import library)
- Blender
- Microsoft 3D Builder

Assimp has a command line tool, that allows easy conversion:

```
# Convert to other cad formats
assimp export drich.gltf drich.obj
```

Assimp supports many formats for export: collada, x, stp, obj, objnomtl, stl,
stlb, ply, plyb, 3ds, gltf2, glb2, gltf, glb, assbin, assxml, x3d
fbx, fbxa, 3mf, assjson

> (!) While STEP is a common format for EIC cad exchange, our experimets opening
> exported files in different CAD software shows that other formats like obj or x3d
> produce cleaner conversion and better results for complex geometry


## Development

**Github clone**
```bash

git clone --recurse-submodules https://github.com/eic/root2cad.git
cd root2cad
npm install

# Running root2cad is the same as
xvfb-run node export.mjs --help    # should work
```


## TODO

- Switch JSROOT from git submodule to npm dependency  
   (possible after the next JSroot release)
- After this it is possible to remove JSROOT depenencies we have to carry:

    ```json
        "atob": "^2.1.2",
        "btoa": "^1.2.1",
        "canvas": "^2.9.0",
        "gl": "^5.0.0",
        "jsdom": "^19.0.0",
        "mathjax": "3.2.0",
        "xhr2": "^0.2.1",
        "zstd-codec": "^0.1.2"
    ```
- Convert geometry element
