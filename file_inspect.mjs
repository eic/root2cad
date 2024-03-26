#!/usr/bin/env node
import * as jsroot from "jsroot";
import { program } from "commander";
import * as fs from "fs";
import thisPackage from './package.json' assert { type: 'json' };

const description = `
root file geometry inspector and a test bench

Examples:
   -- 
`;

let gVerbose = false;

function printTree(nameOrFile) {
    if (typeof nameOrFile === 'string' || nameOrFile instanceof String) {
        // it's a string
        jsroot.openFile(nameOrFile).then(file => printTree(file));
    }
    else {
        let file = nameOrFile;   // it is file
        // console.dir(file)
        if(gVerbose) console.log(`List of objects in '${file.fFileName}' `);
        console.log(`'Name' [type] description:`);

        // Step 1: Find max lengths
        let maxFNameLength = 0;
        let maxFClassNameLength = 0;
        let maxFTitleLength = 0;

        for (let key of file.fKeys) {
            maxFNameLength = Math.max(maxFNameLength, key.fName.length);
            maxFClassNameLength = Math.max(maxFClassNameLength, key.fClassName.length);
            maxFTitleLength = Math.max(maxFTitleLength, key.fTitle.length);
        }

        // Step 2: Print headers
        console.log(
            `${"Name".padEnd(maxFNameLength)} |${"Type".padEnd(maxFClassNameLength)}| ${"Description".padEnd(maxFTitleLength)}`
        );
        console.log("-".repeat(maxFNameLength + maxFClassNameLength + maxFTitleLength + 4)); // 4 for spaces and brackets


        // Step 2: Log with padding
        for (let key of file.fKeys) {
            const fNamePadded = key.fName.padEnd(maxFNameLength);
            const fClassNamePadded = key.fClassName.padEnd(maxFClassNameLength);
            const fTitlePadded = key.fTitle.padEnd(maxFTitleLength);
            console.log(`${fNamePadded} |${fClassNamePadded}| ${fTitlePadded}`);
        }
    }
}


function printGeometry(fileName, objectName, listDepth, how="volume") {

    jsroot.openFile(fileName)
        .then(file => file.readObject(objectName))
        .then(rootObject => {
            
            // Check if such object exists
            if(!rootObject) {
                console.error(`NO OBJECT '${objectName}' IN FILE!`);
                printTree(tree);
                return 1;
            }

            if(gVerbose) console.log(`Opened '${objectName}' object`);
            if(how==="volume"){
                printVolumeRecursive(rootObject.fNodes.arr[0], listDepth, 0, "");
            }
            else {
                printNodeRecursive(rootObject.fNodes.arr[0], listDepth, 0, "");
            }
        })
        .catch(error => {
            console.log(error.message);
        });
}


/// Prints geometry structure
function printNodeRecursive(node, maxLevel=0, level=0, path="") {
    const nodeName = node.fName;
    
    console.log(path + "/" + nodeName);

    if(level>=maxLevel) return;
      
    if (node.fVolume.fNodes) {
        for (let j = 0; j < node.fVolume.fNodes.arr.length; j++) {
            const childNode = node.fVolume.fNodes.arr[j];
            printNodeRecursive(childNode, maxLevel, level + 1, path + "/" + nodeName);
        }
    }
}

function printVolumeRecursive(node, maxLevel=0, level=0, path="") {
    let volume = node._typename === "TGeoManager"? node.fMasterVolume : node.fVolume;

    const nodeName = node.fName;
    const volumeName = volume.fName;
    
    console.log(path + "/" + volumeName);

    if(level>=maxLevel) return;
      
    if (node.fVolume.fNodes) {
        for (const childNode of node.fVolume.fNodes.arr) {            
            printVolumeRecursive(childNode, maxLevel, level + 1, path + "/" + volumeName);
        }
    }
}


/// Find geometry with name
function findNodeByName(node, findName) {
    let volume = node._typename === "TGeoManager"? node.fMasterVolume : node.fVolume;

    if(findName===volume.fName) {
        return node;
    }   

    if (volume.fNodes) {
        for (const childNode of volume.fNodes.arr) {
            const result = findNodeByName(childNode, findName);
            if(result) {
                return result;
            }
        }
    }

    return null;
}

function exportFile(fileName, objectName, outFileName, subGeoName=null) {

    jsroot.openFile(fileName)
        .then(file => file.readObject(objectName))
        .then(rootObject => {
            
            // Check if such object exists
            if(!rootObject) {
                console.error(`NO OBJECT '${objectName}' IN FILE!`);
                printTree(tree);
                return 1;
            }

            // Open success! (reporing)
            console.log(`Opened '${objectName}' object`);

            // Exctracting geometry
            let rootGeo = rootObject;

            // Do wee need to look for subcomponent? 
            if(subGeoName) {
                console.log(`Searching for '${subGeoName}`)
                rootGeo = findNodeByName(rootObject, subGeoName);

                // Check if we found subcomponent
                if(!rootGeo) {
                    console.error(`NO SUB-COMPONENT '${subGeoName}' in geometry! Use --ls command to see subcomponents`);
                    return 1;
                } 
                
                console.log(`Found ${subGeoName}`);
            }
            


        })
        .catch(error => {
            console.error('Error during GLTF export:');
            console.error(error.message);
        });
}

function main() {
    program
    .name('file_inspect')
    .description(description)
    .option('-o, --output <string>', 'Output file name. "exported.gltf" if not set')
    .option('--ls', 'Lists all objects in file or geometry (same as --ls-vol)')    
    .option('--ls-vol', 'Lists geometry hierarchy of VOLUME names. See also --list-depth')
    .option('--ls-node', 'Lists geometry hierarchy of NODE names. See also --list-depth')
    .option('--ls-depth <int>', 'Works with --list, defines the level to print. Default 0')
    .option('-v, --verbose', 'Use verbose output')
    .version(thisPackage.version)
    //.version('1.1.1')
    .argument('[file]', 'File name to open (CERN ROOT files)')
    .argument('[object]', 'Geometry object name in ROOT file to open')
    .argument('[volname]', 'Volume name in geometry hierarchy')

    program.parse();

    const options = program.opts();
    const listCommand = options.ls || options.lsVol || options.lsNode;
    const listDepth = options.lsDepth ? options.lsDepth : 0;    
    const outFileName = options.output ? options.output : "exported.gltf"
    gVerbose = !!options.verbose;

    if(gVerbose) {
        console.log("Verbose output is ON");
    }


    // console.dir(program);
    // List something
    if(listCommand) {
        console.log("Listing...");

        // List ROOT file structure
        if(program.args.length === 1) {
            printTree(program.args[0]);
            return 0;
        }

        // List of geometry structure
        if(program.args.length === 2) {
            if(gVerbose) {
                console.log(`Listing '${program.args[0]}' geometry contents of '${program.args[1]}'`);
                console.log(`List depth is: ${listDepth} (controlled with --ls-depth flag)`);
            }
            
            let how = options.ls || options.lsVol? "volume": "node";
            printGeometry(program.args[0], program.args[1], listDepth, how);
            return 0;
        }

        console.log("Incorrect 'list' parameters. See --help for info and examples");
        
        return 0;
    }

    // Do conversion
    if(program.args.length >= 2) {

        if(program.args.length === 2) {
            console.log(`Converting ${program.args[0]} / ${program.args[1]} to ${outFileName}`);
            exportFile(program.args[0], program.args[1], outFileName);
        } else {
            console.log(`Converting sub-geometry ${program.args[2]} in ${program.args[0]} / ${program.args[1]} to ${outFileName}`);
            exportFile(program.args[0], program.args[1], outFileName, program.args[2]);
        }
        
        return 0;
    }

    // Print help
    program.help();
    return 1;
}


// MAIN HERE
try {
    main();
}
catch(err) {
    console.error(err);
}
