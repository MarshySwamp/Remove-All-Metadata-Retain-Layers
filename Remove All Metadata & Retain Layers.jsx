/* Remove All Metadata & Retain Layers - a brute force alternative to ExifTool
https://community.adobe.com/t5/photoshop/script-to-remove-all-meta-data-from-the-photo/m-p/10400906
Script to remove all meta data from the photo */

#target photoshop

// Error check and run on layered files  
// https://forums.adobe.com/thread/2586379 - r-bin  
var originalDoc = app.activeDocument;

var ok = true;

var background_present = true;
try {
    originalDoc.backgroundLayer;
} catch (e) {
    background_present = false;
}

// Doc only has Background layer
if (background_present && originalDoc.artLayers.length === 1 && originalDoc.layerSets.length === 0) ok = false;

// Doc has only 1 layer (optional, uncomment the line below if required)
// if (!background_present && originalDoc.artLayers.length == 1 && originalDoc.layerSets.length == 0) ok = false;

if (ok) {

    // Park the error checking and run the main script  

    // Expand all layer sets
    openAllLayerSets(app.activeDocument);

    // Select all layers and layer groups/sets!
    selectAllLayers();

    // Call function to duplicate all layers
    DupeSelectedLayers.main = function () {
        DupeSelectedLayers();
    };

    DupeSelectedLayers.main();

    // Deselect layers  
    // https://forums.adobe.com/message/5204655#5204655 - Michael L Hale  
    app.runMenuItem(stringIDToTypeID('selectNoLayers'));

    // Collapse all layer groups/sets
    app.runMenuItem(stringIDToTypeID('collapseAllGroupsEvent'));

    /////////////////////////////////////////////////////////////////////////

    // Run on flattened files
} else {

    var origDoc = app.activeDocument;

    // Call function to duplicate all layers
    DupeSelectedLayers.main = function () {
        DupeSelectedLayers();
    };

    DupeSelectedLayers.main();

}

alert('File duplicated to remove metadata with "_NoMetadata" suffix added to the filename for safety.' + '\r' + 'Note: guides, color samplers, alpha channels, paths and other common document additions have not been copied.');

///// FUNCTIONS /////

function openAllLayerSets(parent) {
    // https://forums.adobe.com/message/5764024#5764024
    for (var setIndex = 0; setIndex < parent.layerSets.length; setIndex++) {
        app.activeDocument.activeLayer = parent.layerSets[setIndex].layers[0];
        openAllLayerSets(parent.layerSets[setIndex]);
    }
}

function selectAllLayers() {
    // https://feedback.photoshop.com/photoshop_family/topics/i-cant-record-sellect-all-layers-in-script-listener-and-in-actions
    var c2t = function (s) {
        return app.charIDToTypeID(s);
    };

    var s2t = function (s) {
        return app.stringIDToTypeID(s);
    };

    var descriptor = new ActionDescriptor();
    var descriptor2 = new ActionDescriptor();
    var reference = new ActionReference();
    var reference2 = new ActionReference();

    reference2.putEnumerated(s2t("layer"), s2t("ordinal"), s2t("targetEnum"));
    descriptor.putReference(c2t("null"), reference2);
    executeAction(s2t("selectAllLayers"), descriptor, DialogModes.NO);
    reference.putProperty(s2t("layer"), s2t("background"));
    descriptor2.putReference(c2t("null"), reference);
    descriptor2.putEnumerated(s2t("selectionModifier"), s2t("selectionModifierType"), s2t("addToSelection"));
    descriptor2.putBoolean(s2t("makeVisible"), false);
    try {
        executeAction(s2t("select"), descriptor2, DialogModes.NO);
    } catch (e) { }
}

// Duplicate all selected layers to new document  
function DupeSelectedLayers() {

    function step1(enabled, withDialog) {
        if (enabled !== undefined && !enabled)
            return;
        cTID = function (s) {
            return app.charIDToTypeID(s);
        };
        sTID = function (s) {
            return app.stringIDToTypeID(s);
        };
        var origFilename = app.activeDocument.name.replace(/\.[^\.]+$/, ''); // Remove filename extension from original
        var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putClass(cTID('Dcmn'));
        desc1.putReference(cTID('null'), ref1);
        desc1.putString(cTID('Nm  '), origFilename + "_NoMetadata"); // Use the original document filename + sufix
        // desc1.putString(cTID('Nm  '), origFilename ); // Use the original document filename, beware overwriting the original file and losing all metadata!              
        var ref2 = new ActionReference();
        ref2.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        desc1.putReference(cTID('Usng'), ref2);
        desc1.putInteger(cTID('Vrsn'), 5);
        executeAction(cTID('Mk  '), desc1, dialogMode);
    }

    step1();
}

///// FUNCTIONS /////
