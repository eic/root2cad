#!/usr/bin/env node
import jsroot from "./jsroot/scripts/JSRoot.core.js";
import { program } from "commander";
import * as fs from "fs";
import * as THREE from 'three';
import { GLTFExporter } from './GLTFExporter.js';

const description = `
CERN ROOT geometry converter to GLTF (CAD) format

Examples:
    # convert root file
    xvfb-run node export.mjs file.root geo_obj_name -o output.gltf

    #

You can view the resulting gltf file e.g. here: 
    https://gltf.insimo.com/
`;

function printTree(nameOrFile) {
    if (typeof nameOrFile === 'string' || nameOrFile instanceof String) {
        // it's a string
        jsroot.openFile(nameOrFile).then(file => printTree(file));
    }
    else {
        let file = nameOrFile;   // it is file
        console.log(`List of objects in '${file.fFileName}' `);
        for(let key of file.fKeys) { 
            console.log(`  ${key.fName}: ${key.fClassName}`); 
        }
    }
}


function printGeometry(fileName, objectName, listDepth) {

    jsroot.openFile(fileName)
        .then(file => file.readObject(objectName))
        .then(rootObject => {
            
            // Check if such object exists
            if(!rootObject) {
                console.error(`NO OBJECT '${objectName}' IN FILE!`);
                printTree(tree);
                return 1;
            }

            console.log(`Opened '${objectName}' object`);
            printNodeRecursive(rootObject.fNodes.arr[0], listDepth, 0, "");
        })
        .catch(error => {
            console.log(error.message);
        });
}


/// Prints geometry structure
function printNodeRecursive(node, maxLevel=0, level=0, path="") {
    const nodeName = node.fName;      
    console.log(path + "/" + nodeName, maxLevel);

    if(level>=maxLevel) return;
      
    if (node.fVolume.fNodes) {
        for (let j = 0; j < node.fVolume.fNodes.arr.length; j++) {
            const childNode = node.fVolume.fNodes.arr[j];
            printNodeRecursive(childNode, maxLevel, level + 1, path + "/" + nodeName);
        }
    }
}

function exportFile(fileName, objectName, outFileName) {

    jsroot.openFile(fileName)
        .then(file => file.readObject(objectName))
        .then(rootObject => {
            
            // Check if such object exists
            if(!rootObject) {
                console.error(`NO OBJECT '${objectName}' IN FILE!`);
                printTree(tree);
                return 1;
            }

            console.log(`Opened '${objectName}' object`);
            //printNodeRecursive(rootObject.fNodes.arr[0], 0, "");
            
            // Load jsroot geometry package
            jsroot.require('geom').then(geo => {
                
                // Create threejs from root geometry
                let obj3d = geo.build(rootObject, { numfaces: 5000000, numnodes: 50000, dflt_colors: true, vislevel: 4});
                
                // EXPORT!
                console.log("Converting to GLTF format");
                const gltfExporter = new GLTFExporter();
                let exportOpts = {};

                gltfExporter.parse(obj3d, function(gltf) {
                    console.log(`Conversion done! Saving to file: ${outFileName}`);
                    
                    // Save to file
                    try {
                        const gltfText = JSON.stringify(gltf);
                        fs.writeFileSync(outFileName, gltfText, {encoding:'utf8'});
                        console.log("Done.");
                    } catch(err) {
                        console.error(err);
                    }
                    
                }, exportOpts);
            });
        })
        .catch(error => {
            console.log(error.message);
        });
}

function main() {
    program
    .name('root2cad')
    .description(description)
    .option('-o, --output <string>', 'Output file name. "exported.gltf" if not set')
    .option('--ls', 'Lists all objects in file. See also --list-level')
    .option('--ls-depth <int>', 'Works with --list, defines the level to print. Default 0')
    .version('1.0.0')
    .argument('[file]', 'File name to open (CERN ROOT files)')
    .argument('[object]', 'Geometry object name in ROOT file to open')

    program.parse();

    const options = program.opts();
    const listCommand = options.ls ? 1 : undefined;
    const listDepth = options.lsDepth ? options.lsDepth : 0;
    const outFileName = options.output ? options.output : "exported.gltf"

    // List something
    if(listCommand) {

        // List ROOT file structure
        if(program.args.length == 1) {
            printTree(program.args[0]);
            return 0;
        }

        // List of geometry structure
        if(program.args.length == 2) {
            console.log(`Listing '${program.args[0]}' geometry contents of '${program.args[1]}'`);
            console.log(`List depth is: ${listDepth} (controlled with --ls-depth flag)`);
            printGeometry(program.args[0], program.args[1], listDepth);
            return 0;
        }
        
        return 0;
    }

    // Do conversion
    if(program.args.length >= 2) {
        console.log(`Converting ${program.args[0]} / ${program.args[1]} to ${outFileName}`);
        exportFile(program.args[0], program.args[1], outFileName);
        return 0;
    }

    //if(listCommand && program.args.length >= 2)

    
    program.help();
    return 1;

    // exportFile("./drich.root", "DRICH", "drich.gltf");
}


// MAIN HERE
try {
    main();
}
catch(err) {
    console.error(err);
}


//jsroot.openFile("https://eicweb.phy.anl.gov/EIC/detectors/athena/-/jobs/559705/artifacts/raw/geo/calorimeters_geo.root?inline=false")
