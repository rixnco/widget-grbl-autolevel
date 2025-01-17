/* global $ chilipeppr requirejs cprequire cprequire_test cpdefine localStorage THREE */
requirejs.config({
    paths: {
        //  Three: '//i2dcui.appspot.com/geturl?url=http://threejs.org/build/three.js',
        Three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r76/three',
        ThreeTextGeometry: '//i2dcui.appspot.com/js/three/TextGeometry',
        ThreeFontUtils: '//i2dcui.appspot.com/js/three/FontUtils',
        ThreeHelvetiker: '//i2dcui.appspot.com/js/three/threehelvetiker'
    },
    shim: {
        ThreeTextGeometry: ['Three'],
        ThreeFontUtils: ['Three', 'ThreeTextGeometry'],
        ThreeHelvetiker: ['Three', 'ThreeTextGeometry', 'ThreeFontUtils'],
    }
});
//make change


// make sure Helvetiker loads
/*
var ThreeHelvetiker;
console.log("Making sure font load code run first.");
window["_typeface_js"] = {loadFace: function(data) {
    console.log("apparently we're supposed to load Helvetiker here???");
    ThreeHelvetiker = data;
}};
console.log(window["_typeface_js"]);
*/

// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-autolevel"], function(autolevel) {
    console.log("test running of " + autolevel.id);
    autolevel.init();

    $('#com-chilipeppr-widget-autolevel').css('position', 'relative');
    $('#com-chilipeppr-widget-autolevel').css('background', 'none');
    $('body').prepend('<div id="3dviewer"></div>');

    chilipeppr.load("#3dviewer", "http://raw.githubusercontent.com/rixnco/widget-3dviewer/master/auto-generated-widget.html", function() {
        cprequire(['inline:com-chilipeppr-widget-3dviewer'], function(threed) {
            threed.init({ doMyOwnDragDrop: true });
            $('#com-chilipeppr-widget-3dviewer .panel-heading').addClass('hidden');
            //autolevel.addRegionTo3d();
            //autolevel.loadFileFromLocalStorageKey('com-chilipeppr-widget-autolevel-recent8');
            //autolevel.toggleShowMatrix();
        });
    });

    //mimic probe request, respond with generic x,y,z coordinates for testing
    chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, function(data) {
        if (data.search(/G38/g) >= 0)
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", { "x": 0, "y": 0, "z": -1.232 });
    });
    /*
    // we mimic the /send and /recvline serial port methods here for testing
    chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, function(data) {
        // when we get a send of {"z":""} reply back as if the tinyg is sending it
        if (data == '{"z":""}\n') {
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline:'{"r":{"z":{"am":1,"vm":400,"fr":200,"tm":70,"jm":3000000,"jh":20000000,"jd":0.0500,"sn":1,"sx":0,"sv":20,"lv":10,"lb":10.000,"zb":0.000},"f":[1,0,9,7178]}}'});
            }, 1000);
        }
        
        if (data == "G28.2 Z0\n") {
            var sr = '{"sr":{"mpoz":0.118}}\n' +
                '{"sr":{"mpoz":0.084}}\n' +
                '{"sr":{"mpoz":0.051}}\n' +
                '{"sr":{"vel":26.58,"mpoz":0.038,"coor":0,"dist":1,"stat":9}}\n' + 
                '{"sr":{"mpoz":0.018}}\n' +
                '{"sr":{"mpoz":-0.014}}\n' +
                '{"sr":{"vel":19.94,"mpoz":-0.047}}\n' +
                '{"sr":{"vel":0.95,"mpoz":-0.065}}\n' +
                '{"sr":{"vel":0.00,"mpoz":-0.065,"stat":3}}\n' +
                '{"qr":27}\n' +
                '{"sr":{"vel":9.94,"mpoz":-0.058,"stat":9}}\n' +
                '{"sr":{"vel":10.00,"mpoz":-0.042}}\n' +
                '{"sr":{"mpoz":-0.025}}\n' +
                '{"sr":{"mpoz":-0.009}}\n' +
                '{"sr":{"vel":0.25,"mpoz":0.002}}\n' +
                '{"qr":28}\n' +
                //'{"sr"{"sr":{"vel":0.00,"stat":3}}\n';
                '{"sr"{"sr":{"mpoz":0.000,"coor":1,"dist":0}}\n';
            var srs = sr.split(/\n/);
            var delay = 0;
            srs.forEach(function(item) {
                delay += 100;
                setTimeout(function() {
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline:item + "\n"});
                }, delay);    
            });
        }
    });
    */

    //var testFinalData = [];

    //autolevel.loadTestData(testFinalData);
    //autolevel.loadFileFromLocalStorageKey('com-chilipeppr-widget-autolevel-recent6');

} /*end_test*/ );


cpdefine("inline:com-chilipeppr-widget-autolevel", ["chilipeppr_ready", "ThreeHelvetiker", "Three"], function() {

    return {
        id: "com-chilipeppr-widget-autolevel",
        url: "(auto fill by runme.js)", // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)", // The standalone working widget so can view it working by itself
        name: "Widget / Auto-Level",
        desc: "Allows you to auto-level your PCB before milling. Most raw PCB boards have a slight warpage. This widget lets you probe the warpage and then it auto-scales your Gcode to match the warpage so you get very clean/predictable z-positions in your milling job.",
        publish: {},
        subscribe: {},
        foreignPublish: {
            "/com-chilipeppr-widget-3dviewer/sceneadd": "We ask the 3D viewer to add THREE.js objects to the scene.",
            "/com-chilipeppr-widget-3dviewer/sceneremove": "We ask the 3D viewer to remove THREE.js objects from the scene.",
            "/com-chilipeppr-widget-3dviewer/request3dObject": "We ask the 3D viewer to send us the user object being shown in 3D viewer so we can analyze it. In particular, we want to know its bounding box for calculating the probe area."
        },
        foreignSubscribe: {
            "/com-chilipeppr-widget-3dviewer/recv3dObject": "When we request a /com-chilipeppr-widget-3dviewer/request3dObject we get back this signal and the payload is the actual user object so we can analyze it.",
            "/com-chilipeppr-interface-cnccontroller/proberesponse": "we receive the parsed probe trigger coordinates back from the cnc interface."
        },
        init: function() {

            this.forkSetup();

            $('#com-chilipeppr-widget-autolevel-showregion').click(this.addRegionTo3d.bind(this));
            $('#com-chilipeppr-widget-autolevel-hideregion').click(this.removeRegionFrom3d.bind(this));
            $('#com-chilipeppr-widget-autolevel-body .autolevel-elem').blur(this.formUpdate.bind(this));
            $('.com-chilipeppr-widget-autolevel-autofill').click(this.autoFillData.bind(this));
            $('.com-chilipeppr-widget-autolevel-run').click(this.startAutoLevel.bind(this));
            $('.com-chilipeppr-widget-autolevel-stop').click(this.stopAutoLevel.bind(this));
            $('.com-chilipeppr-widget-autolevel-pause').click(this.pause.bind(this));
            $('.com-chilipeppr-widget-autolevel-toggleInterpolate').on('click', function() {
                $(this).toggleClass('btn-success');
            }).hide();

            // toggleprobearea
            $('.com-chilipeppr-widget-autolevel-toggleprobearea').click(this.toggleProbeArea.bind(this));

            // runTestProbe
            $('.com-chilipeppr-widget-autolevel-runtestprobe').click(this.runTestProbe.bind(this));

            // gcodesendtows
            $('.com-chilipeppr-widget-autolevel-gcodesendtows').click(this.sendGcodeToWorkspace.bind(this));

            // run this method after modal is dismissed
            //$('#com-chilipeppr-widget-modal-autolevel-start').on('hidden.bs.modal', this.modalComplete.bind(this));
            $('#com-chilipeppr-widget-modal-autolevel-start .btn-autolevel-go').click(this.modalComplete.bind(this));

            $('.com-chilipeppr-widget-autolevel-togglematrix').click(this.toggleShowMatrix.bind(this));
            $('.com-chilipeppr-widget-autolevel-viewdata').click(this.showData.bind(this));

            // setup del files
            $('#com-chilipeppr-widget-autolevel .recent-file-delete').click(this.deleteRecentFiles.bind(this));

            this.buildRecentFileMenu();

            // paste loader
            $('#com-chilipeppr-widget-autolevel .dropdown-menu .paste-load').click(function(e) {
                e.stopPropagation();
            });
            var that = this;
            $('#com-chilipeppr-widget-autolevel .dropdown-menu .paste-load-go').click(function(e) {
                that.loadText();
            });

            // exaggerate detail menu
            $('.com-chilipeppr-widget-autolevel-exaggerate1x').click(1, this.setExaggerate.bind(this));
            $('.com-chilipeppr-widget-autolevel-exaggerate10x').click(10, this.setExaggerate.bind(this));
            $('.com-chilipeppr-widget-autolevel-exaggerate50x').click(50, this.setExaggerate.bind(this));
            $('.com-chilipeppr-widget-autolevel-exaggerate100x').click(100, this.setExaggerate.bind(this));

            //$('#autolevel-run .dropdown-toggle').dropdown()

            // raycast
            $('.com-chilipeppr-widget-autolevel-raycast').click(this.rayCast.bind(this));
            // envelope
            $('.com-chilipeppr-widget-autolevel-envelope').click(this.envelope.bind(this));
            $('.com-chilipeppr-widget-autolevel-gcodeview').click(this.envelopeView.bind(this));

            console.log(this.name + " done loading.");
        },
        showData: function() {
            $('#com-chilipeppr-widget-modal-autolevel-view .modal-body textarea').val(JSON.stringify(this.probes, null, " "));
            $('#com-chilipeppr-widget-modal-autolevel-view .modal-title').text("View Probe Data");
            $('#com-chilipeppr-widget-modal-autolevel-view').modal('show');
        },
        loadText: function() {
            console.log("loading probe data from paste");
            var data = $('#com-chilipeppr-widget-autolevel .dropdown-menu .paste-load').val();
            var name = "Paste: ";
            if (data.length > 20) name += data.substring(0, 20);
            else name += data;
            name = name.replace(/[\r\n]/g, " ");

            var info = {
                name: name,
                lastModified: new Date()
            };
            console.log("info:", info);
            // send event off as if the file was drag/dropped
            this.createRecentFileEntry(data, info);

            // load the data
            var pd = data;
            //console.log("new probe data to load", pd);
            this.probes = $.parseJSON(pd);
            //console.log("new probe data:", this.probes);
            //this.removeRegionFrom3d();
            //this.refreshProbeMatrix();
            if (!this.isMatrixShowing)
                this.toggleShowMatrix();
            else
                this.refreshProbeMatrix();

        },
        deleteRecentFiles: function() {
            console.log("deleting files");
            // loop thru file storage and delete entries that match this widget
            for (var i = 0; i < localStorage.length; i++) {
                console.log("localStorage.item.key:", localStorage.key(i));
                var key = localStorage.key(i);
                if (key.match(/com-chilipeppr-widget-autolevel/))
                    localStorage.removeItem(key);

            }
            //localStorage.clear();
            this.buildRecentFileMenu();
        },
        createRecentFileEntry: function(fileStr, info) {
            console.log("createRecentFileEntry. fileStr.length:", fileStr.length, "info:", info);
            // get the next avail slot
            var lastSlot = -1;
            for (var ctr = 0; ctr < 100; ctr++) {
                if ('com-chilipeppr-widget-autolevel-recent' + ctr in localStorage) {
                    console.log("found recent file entry. ctr:", ctr);
                    lastSlot = ctr;
                }
            }
            console.log("lastSlot we found:", lastSlot);

            var nextSlot = lastSlot + 1;
            var recent = localStorage.getItem("com-chilipeppr-widget-autolevel-recent" + nextSlot);
            if (recent === null) {
                console.log("empty slot. filling.");
                localStorage.setItem("com-chilipeppr-widget-autolevel-recent" + nextSlot, fileStr);
                localStorage.setItem("com-chilipeppr-widget-autolevel-recent" + nextSlot + "-name", info.name);
                localStorage.setItem("com-chilipeppr-widget-autolevel-recent" + nextSlot + "-lastMod", info.lastModified);
                this.buildRecentFileMenu();
            }

        },
        buildRecentFileMenu: function() {

            // cleanup prev recent files
            $('#com-chilipeppr-widget-autolevel .dropdown-menu2 > li.recent-file-item').remove();

            var li = $('#com-chilipeppr-widget-autolevel .dropdown-menu2 > li.recent-files');
            console.log("listItems:", li);
            var ctr = 0;
            var recentName = localStorage.getItem("com-chilipeppr-widget-autolevel-recent" + ctr + "-name");
            while (recentName !== null) {
                console.log("recentFile ctr:", ctr, "recentName:", recentName);
                var recentLastModified = localStorage.getItem("com-chilipeppr-widget-autolevel-recent" + ctr + "-lastMod");
                var rlm = new Date(recentLastModified);
                var recentSize = localStorage.getItem("com-chilipeppr-widget-autolevel-recent" + ctr).length;
                var rsize = parseInt(recentSize / 1024, 10);
                if (rsize === 0) rsize = 1;
                var newLi = $(
                    '<li class="recent-file-item"><a href="javascript:">' + recentName +
                    ' <span class="lastModifyDate">' + rlm.toLocaleString() + '</span>' +
                    ' ' + rsize + 'KB' +
                    '</a></li>');
                //' <button type="button" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-trash"></span></button></a></li>');
                newLi.insertAfter(li);
                var that = this;
                newLi.click("com-chilipeppr-widget-autolevel-recent" + ctr, function(data) {
                    console.log("got recent file click. data:", data);
                    var key = data.data;
                    that.loadFileFromLocalStorageKey(key);

                });

                ctr++;
                recentName = localStorage.getItem("com-chilipeppr-widget-autolevel-recent" + ctr + "-name");

            }
        },
        loadFileFromLocalStorageKey: function(key) {
            // load file into probes
            var info = {
                name: localStorage.getItem(key + '-name'),
                lastModified: localStorage.getItem(key + '-lastMod')
            };
            console.log("loading probe data. localStorage.key:", key, "info:", info);

            // load the data
            var pd = localStorage.getItem(key);
            //console.log("new probe data to load", pd);
            this.probes = $.parseJSON(pd);
            //console.log("new probe data:", that.probes);
            this.status("Loaded probe data \"" + info.name + "\"");
            // if we call this, we'll get the user3dObject
            //this.getBbox();
            //this.removeRegionFrom3d();
            //this.refreshProbeMatrix();
            if (!this.isMatrixShowing)
                this.toggleShowMatrix();
            else
                this.refreshProbeMatrix();
        },
        loadTestData: function(data) {
            this.probes = data;
            console.log("loaded test data");
        },
        matrix: null, // stores our matrix 3d obj
        previousLayerOpacities: [], // store previous opacities that we're overriding
        toggleShowMatrix: function() {
            if ($('.com-chilipeppr-widget-autolevel-togglematrix').hasClass('active')) {
                // that means we're showing the matrix, so hide it
                this.hideProbeMatrix();
                $('.com-chilipeppr-widget-autolevel-togglematrix').removeClass('active');
            }
            else {
                // show it
                if (this.probes.length > 0) {
                    this.showProbeMatrix();
                    $('.com-chilipeppr-widget-autolevel-togglematrix').addClass('active');
                }
                else {
                    this.status("No data to show matrix. Run the probe first.");
                }
            }

        },
        isMatrixShowing: false, //
        showProbeMatrix: function() {

            if (!this.isMatrixShowing) {
                // if we call this, we'll get the user3dObject
                this.getBbox();
                //this.user3dObject.visible = false;
                if (this.user3dObject) {
                    this.removeRegionFrom3d();
                    this.fadeOutUserObject();

                    // now draw our matrix
                    this.drawMatrix();
                }
                console.log("user3dObject:", this.user3dObject);
                this.isMatrixShowing = true;
            }

        },
        hideProbeMatrix: function() {
            if (this.isMatrixShowing) {
                this.removeMatrix();
                this.unfadeOutUserObject();
                this.isMatrixShowing = false;
            }
        },
        refreshProbeMatrix: function() {
            // refreshes matrix without unfading and fading user object
            // which is slow
            this.fadeOutUserObject();
            if (this.isMatrixShowing) {
                this.removeMatrix();
            }
            this.drawMatrix();
            this.isMatrixShowing = true;
        },
        isFadeOutUserObject: false,
        fadeOutUserObject: function() {
            if (!this.isFadeOutUserObject && this.user3dObject !== null) {
                // fade out the user object so our matrix is visible
                chilipeppr.publish('/com-chilipeppr-widget-3dviewer/wakeanimate', "");
                var o = this.user3dObject;
                var that = this;
                that.previousLayerOpacities = [];
                o.children.forEach(function iterLayers(lyr) {
                    //added by jpadie to cater for unhandled bugs when material and/or opacity 
                    //is not defined for the material property
                    if (lyr.material == undefined || lyr.material.opacity == undefined) {}
                    else {
                        that.previousLayerOpacities.push(lyr.material.opacity);
                        lyr.material.opacity = 0.035;
                    }
                });
                this.isFadeOutUserObject = true;
            }
        },
        unfadeOutUserObject: function() {
            if (this.isFadeOutUserObject) {
                // reset previous opacities
                if (this.user3dObject && this.previousLayerOpacities.length > 0) {
                    var o = this.user3dObject;
                    var ctr = 0;
                    var that = this;
                    o.children.forEach(function(lyr) {
                        lyr.material.opacity = that.previousLayerOpacities[ctr];
                        ctr++;
                    });
                }
                this.isFadeOutUserObject = false;
            }
        },
        sendGcodeToWorkspace: function() {
            console.log("sendGcodeToWorkspace");
            var gcodeline = this.envelope({
                addZToAllGCmds: true,
                breakLongGCmdsIntoMoreZ: false
            });
            var gcodetxt = gcodeline.join("\n");
            var info = {
                name: "Auto-Levelled " + gcodetxt.substring(0, 20),
                lastModified: new Date()
            };
            console.log("info:", info);
            // send event off as if the file was drag/dropped
            chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondropped", gcodetxt, info);
        },
        envelopeView: function(evt, opts) {

            // options are
            /* {
                onlyLinesWithZ: true, // (default)
                addZToAllGCmds: true,
                breakLongGCmdsIntoMoreZ: true
            */
            var options = {
                addZToAllGCmds: true,
                breakLongGCmdsIntoMoreZ: false
            };

            if (opts !== null && typeof opts != "undefined") {
                options = opts;
            }

            // show the gcode
            var gcodeline = this.envelope(options);

            //var gcode = this.user3dObject;
            /*
            if (gcode == null) {
                console.log("had to run envelope()");
                this.envelope();
                gcode = this.user3dObject;
            }
            */
            //console.log("gcode:", gcode);
            /*
            var gcodeline = [];
            gcode.userData.lines.forEach(function(item) {
                if ('origtext' in item.args)
                    gcodeline.push(item.args.origtext);
                else if ('text' in item.args)
                    gcodeline.push(item.args.text);
                else
                    gcodeline.push("huh? no gcode text???");
            });
            */
            var gcodetext = gcodeline.join("\n");

            $('#com-chilipeppr-widget-modal-autolevel-view .modal-body textarea').val(gcodetext);
            $('#com-chilipeppr-widget-modal-autolevel-view .modal-title').text("Gcode with Auto-Level Applied");
            $('#com-chilipeppr-widget-modal-autolevel-view').modal('show');
        },
        autolevelledGcode: null,
        envelope: function(options) {
            // options are
            /* {
                onlyLinesWithZ: true, // (default)
                addZToAllGCmds: true,
                breakLongGCmdsIntoMoreZ: true
               }
            */
            if (typeof options == "undefined") {
                options = {};
            }
            if ($('.com-chilipeppr-widget-autolevel-toggleInterpolate').hasClass('btn-success')) {
                options.breakLongGCmdsIntoMoreZ = true;
            }
            console.log("envelope called. options:", options);

            // the 3dviewer contains the orig gcode inside the
            // userData of the 3dobject.
            // we are going to loop thru and find all z's in the gcode
            // and raycast to adjust the z.
            // then we can update all widgets with the new gcode to
            // apply the envelope
            var newgcode = [];
            var gcode = this.user3dObject;
            if (gcode === null) {
                console.log("getting 3d obj from 3d viewer");
                this.get3dObjectFrom3dViewer();
                gcode = this.user3dObject;
            }
            console.log("gcode:", gcode);
            if (gcode.length == 0) {
                this.autolevelledGcode = [];
                return this.autolevelledGcode;

            }

            // unfade so we can see results
            //this.unfadeOutUserObject();

            // we take the mesh and raycast all pts to get their adjusted z
            // probeMesh is set by the drawMatrix() method
            var meshGrp = this.getUnitMesh();
            if (meshGrp === null) {
                console.log("uh oh. mesh is null.");
            }
            else {
                console.log("meshGrp good:", meshGrp);
            }

            // to create ray, we need start point and direction vector
            // already have startpoint vector from gcode, so create direction
            var direction = new THREE.Vector3(0, 0, -1);
            direction.normalize();
            //this.scene.updateMatrixWorld();
            meshGrp.updateMatrix();

            var ctr = 0;
            var ctrtext = 0;
            var ctrtextwithz = 0;
            var ctrtextwithzmatch = 0;
            var ctrIntersected = 0;
            var ctrGCmd = 0;
            var ctrGCmdRayIntersected = 0;
            var ctrGCmdNotValid = 0;

            if (options.breakLongGCmdsIntoMoreZ) {
                var steps = parseFloat($('.grid-steps').val());
                if (isNaN(steps) || steps == 0) steps = 5;

                var _gcode = this.interPolator.interpolate(gcode, steps, true); //interpolate gcode into smaller steps.
                //need to raycast interpolated code here.
                var gcodetxt = _gcode.join("\n");
                var info = {
                    name: "Interpolated gCode for auto-levelling" + gcodetxt.substring(0, 20),
                    lastModified: new Date()
                };
                console.log("info:", info);
                // send event off as if the file was drag/dropped
                chilipeppr.publish("/com-chilipeppr-elem-dragdrop/ondropped", gcodetxt, info);
                gcodetxt = _gcode = null;
            }


            /* it would be more memory efficient to do this on the fly, line by line. */
            
            
            var gcode = this.user3dObject;
            if (gcode === null) {
                console.log("getting 3d obj from 3d viewer");
                this.get3dObjectFrom3dViewer();
                gcode = this.user3dObject;
            }
            gcode.userData.lines.forEach(function(item) {
                // see if gcode line has z val
                var newgcodeline = "";
                if ('origtext' in item.args) {
                    // this is gcode
                    ctrtext++;

                    // set new line to current line just as a starting point
                    // it will get overriden if we modify
                    newgcodeline = item.args.origtext;

                    // see if has z value
                    var txt = item.args.text;
                    //console.log("working on item:", item);
                    if (txt.match(/z/i)) {
                        // yes, there's a z value
                        ctrtextwithz++;

                        // now do raycast
                        var startPoint = new THREE.Vector3(item.p2.x, item.p2.y, item.p2.z + 100);
                        var ray = new THREE.Raycaster(startPoint, direction);
                        var rayIntersects = ray.intersectObject(meshGrp, true);
                        if (rayIntersects[0]) {
                            //item.p2.origz = item.p2.z;
                            item.p2.autolevelz = rayIntersects[0].point.z + item.p2.z;
                            item.p2.autolevelz = item.p2.autolevelz.toFixed(4);
                            // adjust gcode
                            var origtext = item.args.origtext;
                            if (origtext.match(/z {0,}(-{0,1}\d+\.{0,1}\d*)/i)) {
                                var z = RegExp.$1;
                                ctrtextwithzmatch++;
                                var newtxt = origtext.replace(/z {0,}(-{0,1}\d+\.{0,1}\d*)/i, "Z" + item.p2.autolevelz);
                                //item.args.oldtext = item.args.origtext;
                                //item.args.origtext = newtxt + " (al z mod " + item.p2.origz + ")";
                                newgcodeline = newtxt + " (al z mod " + item.p2.z + ")";
                                //console.log("got z:", z, item.args);

                            }
                            ctrIntersected++;
                            //console.log(ctr, txt, item.p2);
                        }
                    }
                    else if (options.addZToAllGCmds && item.args.cmd.match(/^G/i)) {
                        // this is a G command without a z, so let's test it's a valid G cmd
                        // for adding a Z value
                        if (item.args.cmd.match(/G0|G1/i)) {
                            //console.log("got a G0 or G1 cmd. so good to go to add Z");
                            ctrGCmd++;

                            // now do raycast
                            var startPoint = new THREE.Vector3(item.p2.x, item.p2.y, item.p2.z + 100);
                            var ray = new THREE.Raycaster(startPoint, direction);
                            var rayIntersects = ray.intersectObject(meshGrp, true);
                            if (rayIntersects[0]) {

                                ctrGCmdRayIntersected++;

                                //item.p2.origz = item.p2.z;
                                item.p2.autolevelz = rayIntersects[0].point.z + item.p2.z;
                                item.p2.autolevelz = item.p2.autolevelz.toFixed(4);

                                //item.args.oldtext = item.args.origtext;
                                newgcodeline = item.args.origtext + "Z" + item.p2.autolevelz + " (al new z)";
                                //console.log("adding z. new item:", item);
                            }

                        }
                        else {
                            //console.log("this is g cmd without G0 or G1");
                            ctrGCmdNotValid++;
                        }
                    }
                }
                else if ('text' in item.args) {
                    newgcodeline = item.args.text;
                }
                else {
                    newgcodeline = "huh? no gcode text???";
                }
                // push onto final array of gcode
                newgcode.push(newgcodeline);

                ctr++;
            });
            console.log("lines of gcode analyzed:", ctr, "with gcode text:", ctrtext, "txt with z val:", ctrtextwithz, "ctrtextwithzmatch:", ctrtextwithzmatch, "intersected (should be same as with z val):", ctrIntersected);
            console.log("did user want z added to all G cmds", options.addZToAllGCmds, "ctrGCmd:", ctrGCmd, "ctrGCmdNotValid:", ctrGCmdNotValid, "ctrGCmdRayIntersected:", ctrGCmdRayIntersected);
            console.log("ctr:", ctr, "len of newgcode arr (should be same as ctr):", newgcode.length);

            this.autolevelledGcode = newgcode;
            return this.autolevelledGcode;
        },
        getUnitMesh: function() {
            // create new mesh that is not amplified so we can calc off of it
            var p = this.probes;

            var maxx = null;
            var maxy = null;

            // we stored the orig indx of x/y to make converting to 2d array easier
            // this makes our matrix drawing easier
            var pd2 = [];
            p.forEach(function loopThruProbes(item) {
                if (pd2[item.xindx] === undefined) pd2[item.xindx] = [];
                pd2[item.xindx][item.yindx] = item;
            });

            // ok, we've got our 2d array. make triangles

            // try a mesh to show the difference in points and to represent
            // the adjustments we'll do to the z


            var material = new THREE.MeshBasicMaterial();
            //var material = new THREE.MeshNormalMaterial({
            //    side: THREE.DoubleSide
            //});
            //var material = new THREE.MeshLambertMaterial({
            //    color: '#999999',
            //side: THREE.DoubleSide
            //});

            var meshGrp = new THREE.Object3D();
            var holes = [];

            var xctrlen = pd2.length - 1;
            var yctrlen = pd2[0].length - 1;
            //xctrlen = 10;
            //yctrlen = 1;

            for (var ctrx = 0; ctrx < xctrlen; ctrx++) {
                for (var ctry = 0; ctry < yctrlen; ctry++) {

                    // what are the x,y,z vals of start point
                    /*  pt2      pt3
                    
                        pt1      pt4
                    */
                    var x1 = pd2[ctrx][ctry].x;
                    var y1 = pd2[ctrx][ctry].y;
                    var z1 = pd2[ctrx][ctry].z;
                    z1 = (z1 === null) ? 0 : z1;
                    // pt2 is 1 up in y direction
                    var x2 = pd2[ctrx][ctry + 1].x;
                    var y2 = pd2[ctrx][ctry + 1].y;
                    var z2 = pd2[ctrx][ctry + 1].z;
                    z2 = (z2 === null) ? 0 : z2;
                    // pt3 is 1 right in x direction, 1 up in y dir
                    var x3 = pd2[ctrx + 1][ctry + 1].x;
                    var y3 = pd2[ctrx + 1][ctry + 1].y;
                    var z3 = pd2[ctrx + 1][ctry + 1].z;
                    z3 = (z3 === null) ? 0 : z3;
                    // pt4 is 1 right in x direction
                    var x4 = pd2[ctrx + 1][ctry].x;
                    var y4 = pd2[ctrx + 1][ctry].y;
                    var z4 = pd2[ctrx + 1][ctry].z;
                    z4 = (z4 === null) ? 0 : z4;

                    // add to mesh
                    //geom.vertices.push(new THREE.Vector3(cx,cy,cz));
                    var vertices = [];
                    var triangles, mesh;
                    var geometry = new THREE.Geometry();

                    var v = new THREE.Vector3(x1, y1, z1);
                    //console.log("adding pt1:", v);
                    if (z1 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x2, y2, z2);
                    //console.log("adding pt2:", v);
                    if (z2 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x3, y3, z3);
                    //console.log("adding pt3:", v);
                    if (z3 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x4, y4, z4);
                    //console.log("adding pt3:", v);
                    if (z4 !== null) vertices.push(v);

                    geometry.vertices = vertices;

                    //console.log("about to triangulate shape. vertices:", vertices, "holes:", holes);
                    triangles = THREE.ShapeUtils.triangulateShape(vertices, holes);
                    for (var i = 0; i < triangles.length; i++) {
                        geometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][1], triangles[i][2]));

                    }

                    //geometry.computeCentroids();
                    geometry.computeFaceNormals();
                    mesh = new THREE.Mesh(geometry, material);
                    meshGrp.add(mesh);
                }
            }
            return meshGrp;

        },
        rayCast: function() {
            // RayCast
            // To do this we need to take all points in the Gcode
            // so we'll have to ask the 3D viewer for them
            // then we cast those points onto the mesh from the probe
            // data. This will give us the intersection points.
            // Then we can adjust the z positions of the gcode
            // to their new positions that would match the probe warpage
            var gcode = this.user3dObject;
            if (gcode === null) {
                console.log("getting 3d obj from 3d viewer");
                this.get3dObjectFrom3dViewer();
                gcode = this.user3dObject;
            }
            console.log("gcode:", gcode);
            var ctr = 0;
            var ctrIntersected = 0;
            console.log("[0]:", gcode.children[0].geometry);

            // unfade so we can see results
            this.unfadeOutUserObject();

            // we take the mesh and raycast all pts to get their adjusted z
            // probeMesh is set by the drawMatrix() method
            var meshGrp = this.probeMesh;
            if (meshGrp === null) {
                console.log("uh oh. mesh is null.");
            }
            else {
                console.log("meshGrp good:", meshGrp);
            }

            // to create ray, we need start point and direction vector
            // already have startpoint vector from gcode, so create direction
            var direction = new THREE.Vector3(0, 0, -1);
            direction.normalize();
            //this.scene.updateMatrixWorld();
            meshGrp.updateMatrix();
            // loop thru each point in gcode and adjust z height
            // essentially we're applying the probe data envelope to gcode
            gcode.children[0].geometry.vertices.forEach(function(item) {
                //if (item.x < 50 && item.y < 5) {
                //console.log("found point inside test area. item:", item);
                // move z way up so it's above mesh
                //item.z = item.z + 100;

                var startPoint = new THREE.Vector3(item.x, item.y, item.z + 100);
                var ray = new THREE.Raycaster(startPoint, direction);
                var rayIntersects = ray.intersectObject(meshGrp, true);
                //if (ctr < 10) {
                if (rayIntersects[0]) {
                    //console.log("we do have an intersection:", rayIntersects);
                    item.z = rayIntersects[0].point.z;
                    ctrIntersected++;
                }
                else {
                    //console.log("no intersecting of ray to mesh");
                }
                //}
                item.z = item.z + 10;
                ctr++;
                //}
            });
            gcode.children[0].geometry.verticesNeedUpdate = true;
            console.log("adjusted z on #pts", ctr, "ctrIntersected:", ctrIntersected);

        },
        exaggerateMult: 50, // exaggerate the detail by multiplying z value
        setExaggerate: function(evt) {
            console.log("setting exaggerate level:", evt.data);
            this.exaggerateMult = evt.data;
            if (this.isMatrixShowing)
                this.refreshProbeMatrix();
        },
        probeMesh: null, // stores the mesh of probe data for later raycasting
        drawMatrix: function() {

            var color = '#660000';

            // Create dashed line material
            var material = new THREE.LineDashedMaterial({
                vertexColors: false,
                color: color,
                dashSize: 1,
                gapSize: 1,
                linewidth: 2,
                transparent: true,
                opacity: 0.8
            });

            var p = this.probes;

            var maxx = null;
            var maxy = null;
            //var lastz = null;
            // we stored the orig indx of x/y to make converting to 2d array easier
            // this makes our matrix drawing easier
            var pd2 = [];
            p.forEach(function loopThruProbes(item) {
                if (maxx === null) maxx = item.x;
                else if (item.x > maxx) maxx = item.x;
                if (maxy === null) maxy = item.x;
                else if (item.y > maxy) maxy = item.y;

                // calc zabs
                //if (lastz == null) item.zabs = 0; // makes 1st probe be 0 pos on Z
                //else if (item.z == null) item.zabs = 0; // if no data yet for z, just use 0
                //else item.zabs = lastz + item.z; // adds last z to this z to convert relative to abs
                //else item.zabs = lastz + item.zmaxlowest; // adds last z to this z to convert relative to abs

                // since we're probing with g38.2 now, we have an abs val already, no relative. thank god!
                //item.zabs = item.zprobe;

                // inject into 2d array
                //console.log("inject 2d array. item.xindx:", item.xindx);
                if (pd2[item.xindx] === undefined) pd2[item.xindx] = [];
                pd2[item.xindx][item.yindx] = item;

                //lastz = item.zabs;
            });
            this.maxx = maxx;
            this.maxy = maxy;
            console.log("maxx:", maxx, "maxy:", maxy);
            console.log("pd2:", pd2);

            /*
            // now that our zabs is calculated
            // let's take our probe data and put in 2d array so we can manipulate better
            // we need to generate triangles so need pts in a square to make 2 triangles
            // out of. since we know we did a grid we should do 2 triangles per square
            var pd = [];
            p.forEach(function(item) {
                if (pd[item.x] === undefined) pd[item.x] = [];
                pd[item.x][item.y] = item;
            });
            console.log("don generating 2d arra. pd:", pd);
            console.log("x length:", pd.length);
            console.log("one of the y lengths:", pd[p[0].x].length);
            
            // ok, now collapse pd[][] to new array with new indexes
            var pd2 = [];
            var ix = 0;
            for(var ctrx = 0; ctrx < pd.length; ctrx++) {
                if (pd[ctrx] !== undefined) {
                    if (pd2[ix] === undefined) pd2[ix] = [];
                    var iy = 0;
                    for(var ctry = 0; ctry < pd[p[0].x].length; ctry++) {
                        if (pd[ctrx][ctry] !== undefined) {
                            pd2[ix][iy] = pd[ctrx][ctry];
                            iy++;
                        }
                    }
                    ix++;
                }
            }
            console.log("new pd2:", pd2);
            */



            // ok, we've got our 2d array. make triangles

            // try a mesh to show the difference in points and to represent
            // the adjustments we'll do to the z


            //var material = new THREE.MeshBasicMaterial();
            //var material = new THREE.MeshNormalMaterial({
            //    side: THREE.DoubleSide
            //});
            var material = new THREE.MeshLambertMaterial({
                color: '#999999',
                side: THREE.DoubleSide
            });

            var meshGrp = new THREE.Object3D();
            var holes = [];

            var xctrlen = pd2.length - 1;
            var yctrlen = pd2[0].length - 1;
            //xctrlen = 10;
            //yctrlen = 1;

            for (var ctrx = 0; ctrx < xctrlen; ctrx++) {
                for (var ctry = 0; ctry < yctrlen; ctry++) {

                    // what are the x,y,z vals of start point
                    /*  pt2      pt3
                    
                        pt1      pt4
                    */
                    var x1 = pd2[ctrx][ctry].x;
                    var y1 = pd2[ctrx][ctry].y;
                    var z1 = pd2[ctrx][ctry].z;
                    z1 = (z1 === null) ? 0 : z1;
                    // pt2 is 1 up in y direction
                    var x2 = pd2[ctrx][ctry + 1].x;
                    var y2 = pd2[ctrx][ctry + 1].y;
                    var z2 = pd2[ctrx][ctry + 1].z;
                    z2 = (z2 === null) ? 0 : z2;
                    // pt3 is 1 right in x direction, 1 up in y dir
                    var x3 = pd2[ctrx + 1][ctry + 1].x;
                    var y3 = pd2[ctrx + 1][ctry + 1].y;
                    var z3 = pd2[ctrx + 1][ctry + 1].z;
                    z3 = (z3 === null) ? 0 : z3;
                    // pt4 is 1 right in x direction
                    var x4 = pd2[ctrx + 1][ctry].x;
                    var y4 = pd2[ctrx + 1][ctry].y;
                    var z4 = pd2[ctrx + 1][ctry].z;
                    z4 = (z4 === null) ? 0 : z4;

                    // add to mesh
                    //geom.vertices.push(new THREE.Vector3(cx,cy,cz));
                    var vertices = [];
                    var triangles, mesh;
                    var geometry = new THREE.Geometry();

                    var v = new THREE.Vector3(x1, y1, z1 * this.exaggerateMult);
                    //console.log("adding pt1:", v);
                    if (z1 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x2, y2, z2 * this.exaggerateMult);
                    //console.log("adding pt2:", v);
                    if (z2 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x3, y3, z3 * this.exaggerateMult);
                    //console.log("adding pt3:", v);
                    if (z3 !== null) vertices.push(v);
                    var v = new THREE.Vector3(x4, y4, z4 * this.exaggerateMult);
                    //console.log("adding pt3:", v);
                    if (z4 !== null) vertices.push(v);

                    geometry.vertices = vertices;

                    //console.log("about to triangulate shape. vertices:", vertices, "holes:", holes);
                    triangles = THREE.ShapeUtils.triangulateShape(vertices, holes);
                    for (var i = 0; i < triangles.length; i++) {
                        geometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][1], triangles[i][2]));

                    }

                    //geometry.computeCentroids();
                    geometry.computeFaceNormals();
                    mesh = new THREE.Mesh(geometry, material);
                    meshGrp.add(mesh);
                }
            }

            // create a new line to show path
            var startx = p[0].x;
            var starty = p[0].y;
            var x, y, z;
            x = maxx;
            y = maxy;
            z = 0;
            var lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(
                new THREE.Vector3(startx, starty, z),
                new THREE.Vector3(x, starty, z),
                new THREE.Vector3(x, starty, z),
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(startx, y, z),
                new THREE.Vector3(startx, y, z),
                new THREE.Vector3(startx, starty, z)
            );
            lineGeo.computeLineDistances();
            var line = new THREE.Line(lineGeo, material, THREE.LinePieces);
            line.type = THREE.Lines;

            // create text
            var txtObj = this.makeSprite({
                x: startx,
                y: maxy + 3,
                z: z,
                text: "Final Matrix",
                color: color,
                size: 3,
                side: THREE.DoubleSide
            });

            // create circles to represent probe
            var circleGrp = new THREE.Object3D();

            var material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });

            var radius = 0.4;
            var segments = 6;

            //var geom = new THREE.Geometry();

            var that = this;
            p.forEach(function createAllCircles(probe) {

                var circleGeometry = new THREE.CircleGeometry(radius, segments);
                var circle = new THREE.Mesh(circleGeometry, material);
                var cx = probe.x;
                var cy = probe.y;
                var cz = probe.z === null ? 0 : probe.z;
                //console.log("adding circle. ctrx:", ctrx, "ctry:", ctry, "x", cx, "cy", cy);
                circle.position.set(cx, cy, cz);
                circleGrp.add(circle);

                // create text label
                var txtLbl = that.makeSprite({
                    x: cx + 1,
                    y: cy + 1,
                    z: z,
                    text: probe.done ? cz.toFixed(3) : "-",
                    color: color,
                    size: 0.5
                });
                circleGrp.add(txtLbl);

            });


            //geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
            //geom.computeFaceNormals();

            //var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

            //object.position.z = -100;//move a bit back - size of 500 is a bit big
            //object.rotation.y = -Math.PI * .5;//triangle is pointing in depth, rotate it -90 degrees on Y

            //scene.add(object);

            // create group to put everything into
            this.matrix = new THREE.Object3D();
            //this.matrix.add(line);
            this.matrix.add(txtObj);
            this.matrix.add(circleGrp);
            this.matrix.add(meshGrp);

            // store meshGrp in property so we can access it
            // from other methods since it's the envelope to adjust
            // the gcode
            this.probeMesh = meshGrp;

            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", this.matrix);

        },
        removeMatrix: function() {
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneremove", this.matrix);
            //deallocate geometry
            this.matrix.traverse(function(child) {
                if (child.geometry !== undefined) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
        },
        onDisplay: function() {
            this.autoFillData();
            this.formUpdate();
        },
        onUndisplay: function() {
            this.removeRegionFrom3d();
        },
        runTestProbe: function() {
            this.status("Runing test probe.");
            this.send("G21 G90 (Use mm and abs coords)\n");
            this.send("G38.2 Z-10 F5\n");
        },
        startAutoLevel: function() {
            // connect to cnccontroller for probe responses
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/proberesponse", this, this.probeResponse);

            this.currentStep = null;
            this.isPaused = false;

            $('.com-chilipeppr-widget-autolevel-run').popover('hide');
            $('.com-chilipeppr-widget-autolevel-pause').popover('hide');
            $('.com-chilipeppr-widget-autolevel-run').prop('disabled', true);
            $('.com-chilipeppr-widget-autolevel-pause').prop('disabled', false);
            this.genProbeGcode();
        },
        stopAutoLevel: function() {
            // connect to cnccontroller for probe responses
            chilipeppr.unsubscribe("/com-chilipeppr-interface-cnccontroller/proberesponse", this, this.probeResponse);
            chilipeppr.publish("/com-chilipeppr-widget-grbl-autolevel/probing", false);
            this.isPaused = true;
            $('.com-chilipeppr-widget-autolevel-stop').popover('hide');
            $('.com-chilipeppr-widget-autolevel-pause').popover('hide');
            $('.com-chilipeppr-widget-autolevel-run').prop('disabled', false);
            $('.com-chilipeppr-widget-autolevel-pause').prop('disabled', true);
            this.currentStep = null; //when stopping probing or completing probe run, reset currentStep to null to indicate to probeResponse function that we are not expecting any further communication from cnc interface.
        },
        formUpdate: function() {
            this.calcSteps();
            this.genProbeSteps();
            this.status("Will probe " + this.probes.length + " locations");
            this.addRegionTo3d();
        },
        probes: [], // object array of x/y vals of probe locations
        maxx: null,
        maxy: null,
        genProbeGcode: function() {
            this.addRegionTo3d();
            this.status("Starting probe process");
            this.modalStart();
            // will go to modalComplete() after this if user hits "go"
        },
        //go: false, // this is set by modal to true if they said "go"
        modalComplete: function() {

            // only do if they said "go"
            //if (!this.go) return;
            //this.status("Getting your current Z Min homing settings so we can restore them later.");
            //this.getZMinSettings(function() {
            // after we get our zmin settings, we'll get a callback to here

            // switch min homing sn:1
            // search velocity sv:20 mm/min
            // latch velocity lv:10 mm/min
            // latch backoff lb:5 mm (should not happen if circuit correct)
            // zero backoff zb:0
            //this.status("Configuring the TinyG Z Min homing settings for the probe process.");
            //this.send('{"z":{"sn":1,"sv":10,"lv":2,"lb":3.000,"zb":0.000}\n');
            //this.send("(Set TinyG Z to Homing with Offset of 0)\n");
            this.status("Going into mm and abs coord mode");
            this.send("G21 G90 (Use mm and abs coords)\n");
            //this.send("G0 Z1.5\n");

            this.status("Generating probe steps.");
            this.genProbeSteps();

            // now that we have probe steps, go to 1st loc and do direct zeroing out of z
            //this.send("G0 X" + this.probes[0].x + " Y" + this.probes[0].y + "\n");
            // send long neg z command (hope this works)
            //this.send("G38.2 Z-10 F5\n");

            /*
            var probe = {firstPos: true, x: this.probes[0].x, y: this.probes[0].y};
                var that = this;
                this.watchZ(probe, function() {
                    // this is called when done watching z
                    // we need to set z to zero from 1st probe
                    console.log("got done watchz callback on 1st step. zeroing out z.");
                    that.status("Zeroing out Z on 1st probe as baseline Z.");
                    that.send("G28.3 Z0\n");
                    setTimeout(that.doNextStep.bind(that), 200);
                });
                */

            // start the process            
            this.doNextStep();

            //});

        },
        genProbeSteps: function() {
            // we'll generate the probe steps and store in this.probe object array
            var steps = this.calcSteps();
            var pos = "";

            // clear prev probe steps
            this.probes = [];

            // next step
            var stepsxMult = steps.stepsx < 0 ? -1 : 1;
            var stepsyMult = steps.stepsy < 0 ? -1 : 1;

            var directiony = null;
            for (ctrx = 0; ctrx <= Math.abs(steps.stepsx); ctrx++) {

                var yprobes = [];

                // reverse y direction so we get up/down zig zag for less
                // y travel as we probe surface, otherwise we keep going to y=0
                // for each grid column and waste movements
                if (directiony === null) directiony = "up";
                else if (directiony == "up") directiony = "down";
                else directiony = "up";

                for (ctry = 0; ctry <= Math.abs(steps.stepsy); ctry++) {

                    var cx = steps.startx + (ctrx * steps.stepsevery * stepsxMult);
                    var cy = steps.starty + (ctry * steps.stepsevery * stepsyMult);

                    pos = "x:" + cx + ",y:" + cy;

                    // create a probe record
                    var key = pos;
                    var val = {
                        sent: false,
                        done: false,
                        x: cx,
                        y: cy,
                        z: null,
                        ts: null,
                        xindx: ctrx,
                        yindx: ctry
                    }; // zabs: null, zmaxlowest: null,
                    yprobes.push(val);

                }

                if (directiony == "down") {
                    // reverse order the yprobes array and push
                    this.probes = this.probes.concat(yprobes.reverse());
                }
                else {
                    this.probes = this.probes.concat(yprobes);
                }

            }
            this.status("Generated " + this.probes.length + " probe locations.");
            //console.log("probes:", this.probes);
        },
        currentStep: null, // keep track of which step we're on
        currentStep: null, // keep track of which step we're on
        isPaused: false,
        pause: function() {
            // remove popovers
            $('.com-chilipeppr-widget-autolevel-pause').popover('hide');
            if (this.isPaused) {
                // unpause
                console.log("unpausing");
                this.status("Unpaused");
                this.isPaused = false;
                this.doNextStep();
                $('.com-chilipeppr-widget-autolevel-pause').removeClass('active');
            }
            else {
                // need to pause
                console.log("pausing...");
                this.status("Paused");
                this.isPaused = true;
                $('.com-chilipeppr-widget-autolevel-pause').addClass('active');
            }
        },
        doNextStep: function() {

            console.log("doNextStep");

            if (this.isPaused) {
                console.log("we are paused. returning.");
                this.status("Paused");
                return;
            }

            if (this.currentStep === null) {
                // we are just starting
                this.status("Starting probes");
                this.currentStep = 0;
                chilipeppr.publish("/com-chilipeppr-widget-grbl-autolevel/probing", true);

            }
            else {
                this.currentStep++;
                console.warn("AUTOLEVEL WIDGET: moving to next probe point.");
                this.status("moving to next probe point");
            }

            if (this.currentStep >= this.probes.length) {
                // we're done
                console.log("next step is greater than probes array length. done.");
                this.status("Moving Z to safety height");
                var g = "(Moving to Z safety height)\n" +
                    "G91\n" +
                    "G0Z" + $('.autolevel-elem.al-coord.z-safetyheight').val() + "\n" +
                    "G90\n";
                this.send(g);
                this.status("Done running probe. Found all Zs for " + this.probes.length + " locations");
                this.stopAutoLevel();
                chilipeppr.publish("/com-chilipeppr-widget-grbl-autolevel/probing", false);

                // store file automatically
                var fileStr = JSON.stringify(this.probes);
                var lastLoc = "x:" + this.probes[this.probes.length - 1].x + ",y:" + this.probes[this.probes.length - 1].y;
                var info = {
                    name: "Probed " + this.probes.length + " locs. Last loc: " + lastLoc,
                    lastModified: new Date()
                };
                this.createRecentFileEntry(fileStr, info);
                this.status("Created a recent probe data entry for you called \"" + info.name + "\" available in pulldown menu for this widget.");

                // spit out debug
                console.log("Final JSON data.", JSON.stringify(this.probes));
                return;
            }

            //These values should be pulling off input boxes, need to be updated to get the .val() of the specific input box.

            var probe = this.probes[this.currentStep];
            var pos = '{x:' + probe.x + ',y:' + probe.y + '}';
            this.status("Moving to " + pos);
            this.send("G0 Z" + $(".high-z").val() + "\n"); //raise probe
            this.send("G0 X" + probe.x + " Y" + probe.y + "\n"); //move to next probe point
            this.send("G0 Z" + $(".probe-z").val() + "\n"); //lower probe to starting point

            if (this.currentStep == 0) {
                // could adjust the z value for the first probe to find the surface, but currently it is same as other steps.
                this.send("G38.2 Z" + $(".maxneg-z").val() + " F" + $(".probe-fr").val() + "\n");
            }
            else {
                // on subsequent we have a known z near pcb board so no need to go too negative (just in case)
                this.send("G38.2 Z" + $(".maxneg-z").val() + " F" + $(".probe-fr").val() + "\n");
            }

            probe.sent = true; //mark probe sent as true.

        },
        probeResponse: function(result) {
            //expecting either coordinate object {"x":x,"y":y,"z":z} (float values) or string "alarm" if probe failed.

            //console.log("received probe response");
            if (result !== "alarm" && this.currentStep !== null) {
                console.log("received probe response: ", result);
                var probe = this.probes[this.currentStep]; //pull current probe

                probe.z = result.z;

                probe.done = true;
                probe.ts = new Date();

                if (this.currentStep === 0) {
                    // this is our 1st position, which isn't really a position, it's our auto-setting of 0
                    //this.status("Set our 1st probe position as new Z zero.");
                    probe.z = 0;
                    this.send("G92Z0\n"); //reset Z to
                }
                else {
                    var pos = '{x:' + probe.x + ',y:' + probe.y + '}';
                    this.status("Working on probe for " + pos + " Found lowest Z:" + probe.z);
                }

                // update matrix to show results
                this.removeRegionFrom3d();
                if (!this.isMatrixShowing)
                    this.toggleShowMatrix();
                else
                    this.refreshProbeMatrix();

                this.doNextStep();
            }
            //receiving alarm state will put the probing into pause, and move back one step so that the same probe can be attempted again.
            //at this point user may need to cancel probing and regenerate probe commands with a different max neg z, or unlock controller (if locked in alarm state) and unpause to try the probe again.
            else if (result == 'alarm') {
                //handle for alarm state?
                console.log("Auto Level: uh oh, alarm state received...");

                this.status("probe failed, clear controller alarm before resuming");
                this.pause(); //pause execution
                this.currentStep--; //move back one step so that after alarm is reset probing can repeat the failed attempt.
            }
            else {
                return false; //ignore probe response because the probe command came from some other widget.   
            }
        },
        send: function(gcode) {
            // send our data
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", gcode);
        },
        statEl: null, // cache the status element in DOM
        status: function(txt) {
            console.log("status. txt:", txt);
            if (this.statEl === null) this.statEl = $('#com-chilipeppr-widget-autolevel-status');
            var len = this.statEl.val().length;
            if (len > 1000) {
                console.log("truncating auto-level stats");
                this.statEl.val(this.statEl.val().substring(len - 500));
            }
            this.statEl.val(this.statEl.val() + "\n" + txt);
            this.statEl.scrollTop(
                this.statEl[0].scrollHeight - this.statEl.height()
            );
        },
        zsettings: null, // stores our z settings from tinyg
        modalStart: function() {
            $('#com-chilipeppr-widget-modal-autolevel-start').modal('show');

        },
        autoFillData: function() {
            // read the 3d viewer data and auto-fill the extents
            var b = this.getBbox();

            var stepsevery = $('#com-chilipeppr-widget-autolevel-body .grid-steps').val();
            stepsevery = parseFloat(stepsevery);

            /*
            var endx = stepsevery * (parseInt((b.box.max.x - b.box.min.x) / stepsevery,10) + 1);
            var endy = stepsevery * (parseInt((b.box.max.y - b.box.min.y) / stepsevery,10) + 1);
            */
            //added by jpadie to cater for non-vertex origins
            var endx = (stepsevery * (parseInt((b.box.max.x - b.box.min.x) / stepsevery, 10) + 1)) + b.box.min.x;
            var endy = (stepsevery * (parseInt((b.box.max.y - b.box.min.y) / stepsevery, 10) + 1)) + b.box.min.y;

            //bbox.box.min.x
            $('#com-chilipeppr-widget-autolevel-body .start-x').val(b.box.min.x);
            $('#com-chilipeppr-widget-autolevel-body .start-y').val(b.box.min.y);
            $('#com-chilipeppr-widget-autolevel-body .end-x').val(endx);
            $('#com-chilipeppr-widget-autolevel-body .end-y').val(endy);
            this.formUpdate();
        },
        user3dObject: null,
        recv3dObject: function(obj) {
            console.log("just got the user object:");
            this.user3dObject = obj;
        },
        get3dObjectFrom3dViewer: function() {
            // query the 3d viewer for it's core object
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
            chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);

        },
        bboxHelper: null,
        getBbox: function() {
            // query the 3d viewer for it's core object
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/request3dObject", "");
            chilipeppr.unsubscribe("/com-chilipeppr-widget-3dviewer/recv3dObject", this, this.recv3dObject);

            // then get its bounding box
            var helper = new THREE.BoundingBoxHelper(this.user3dObject, 0xff0000);
            helper.update();
            this.bboxHelper = helper;
            // If you want a visible bounding box
            //scene.add(helper);
            // If you just want the numbers
            console.log("min bbox:", helper.box.min);
            console.log("max bbox:", helper.box.max);

            //chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", this.bboxHelper);
            return this.bboxHelper;

        },
        calcSteps: function() {
            console.log("calcSteps");
            var startx = $('#com-chilipeppr-widget-autolevel-body .start-x').val();
            var starty = $('#com-chilipeppr-widget-autolevel-body .start-y').val();
            var endx = $('#com-chilipeppr-widget-autolevel-body .end-x').val();
            var endy = $('#com-chilipeppr-widget-autolevel-body .end-y').val();
            var stepsevery = $('#com-chilipeppr-widget-autolevel-body .grid-steps').val();
            startx = parseFloat(startx);
            starty = parseFloat(starty);
            endx = parseFloat(endx);
            endy = parseFloat(endy);
            stepsevery = parseFloat(stepsevery);
            var stepsx = (endx - startx) / stepsevery;
            var stepsy = (endy - starty) / stepsevery;
            $('#com-chilipeppr-widget-autolevel-body .calc-steps').text(
                "Steps X: " + stepsx + ", Steps Y: " + stepsy);
            return {
                stepsevery: stepsevery,
                startx: startx,
                starty: starty,
                endx: endx,
                endy: endy,
                stepsx: stepsx,
                stepsy: stepsy
            };
        },
        toggleProbeArea: function() {
            if ($('.com-chilipeppr-widget-autolevel-toggleprobearea').hasClass('active')) {
                // that means we're showing the region, so hide it
                this.removeRegionFrom3d();
                $('.com-chilipeppr-widget-autolevel-toggleprobearea').removeClass('active');
            }
            else {
                // show it
                this.addRegionTo3d();
                $('.com-chilipeppr-widget-autolevel-toggleprobearea').addClass('active');
            }

        },
        regionObj: null,
        isRegionShowing: false,
        addRegionTo3d: function() {
            console.log("addRegionTo3d");

            // since we're going to overwrite the current regionObj, we better
            // remove it first
            if (this.regionObj !== null) {
                this.removeRegionFrom3d();
            }

            $('.com-chilipeppr-widget-autolevel-toggleprobearea').addClass('active');

            // get bounding box of user data in 3d viewer
            this.getBbox();

            var color = '#660000';

            var steps = this.calcSteps();

            var stepsxMult = steps.stepsx < 0 ? -1 : 1;
            var stepsyMult = steps.stepsy < 0 ? -1 : 1;

            // Create bounding box
            var material = new THREE.LineDashedMaterial({
                vertexColors: false,
                color: color,
                dashSize: 1,
                gapSize: 1,
                linewidth: 2,
                transparent: true,
                opacity: 0.8
            });

            // create a new line to show path
            var startx = steps.startx;
            var starty = steps.starty;
            var x, y, z;
            x = steps.endx;
            y = steps.endy;
            z = 0;
            var lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(
                new THREE.Vector3(startx, starty, z),
                new THREE.Vector3(x, starty, z),
                new THREE.Vector3(x, starty, z),
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(startx, y, z),
                new THREE.Vector3(startx, y, z),
                new THREE.Vector3(startx, starty, z)
            );
            lineGeo.computeLineDistances();
            var line = new THREE.Line(lineGeo, material, THREE.LinePieces);
            line.type = THREE.Lines;

            // create text
            var txtObj = this.makeSprite({
                x: startx,
                y: y + (stepsyMult < 0 ? -4 : 0 /* font size offset only if negative on the y */ ) + (2 * stepsyMult /* margin offset */ ),
                z: z,
                text: "Probe Area",
                color: color,
                size: 4
            });

            // create circles to represent probe
            var circleGrp = new THREE.Object3D();

            var material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5
            });

            var radius = 0.4;
            var segments = 6;


            for (ctrx = 0; ctrx <= Math.abs(steps.stepsx); ctrx++) {

                for (ctry = 0; ctry <= Math.abs(steps.stepsy); ctry++) {

                    var circleGeometry = new THREE.CircleGeometry(radius, segments);
                    var circle = new THREE.Mesh(circleGeometry, material);
                    var cx = steps.startx + (ctrx * steps.stepsevery * stepsxMult);
                    var cy = steps.starty + (ctry * steps.stepsevery * stepsyMult);
                    var cz = z;
                    //console.log("adding circle. ctrx:", ctrx, "ctry:", ctry, "x", cx, "cy", cy);
                    circle.position.set(cx, cy, cz);
                    circleGrp.add(circle);
                }

            }

            // Start / End Labels
            // create text
            var txtStart = this.makeSprite({
                x: steps.startx,
                y: steps.starty,
                z: z,
                text: "Start",
                color: color,
                size: 2
            });
            var txtEnd = this.makeSprite({
                x: steps.endx,
                y: steps.endy,
                z: z,
                text: "End",
                color: color,
                size: 2
            });

            // create group to put everything into
            this.regionObj = new THREE.Object3D();
            this.regionObj.add(line);
            this.regionObj.add(txtObj);
            this.regionObj.add(txtStart);
            this.regionObj.add(txtEnd);
            this.regionObj.add(circleGrp);

            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneadd", this.regionObj);
            this.isRegionShowing = true;

        },
        removeRegionFrom3d: function() {
            if (this.isRegionShowing === true) {
                console.log("removeRegionFrom3d");
                chilipeppr.publish("/com-chilipeppr-widget-3dviewer/sceneremove", this.regionObj);
                this.isRegionShowing = false;
            }
        },
        /* Args for vals 
        vals = {
            x: 110,
            y: 0,
            z: 0,
            text: "X",
            color: "#ff0000",
            size: 10
        }
        */
        makeSprite: function(vals) {
            var shapes, geom, mat, mesh;

            //console.log("Do we have the global ThreeHelvetiker font:", ThreeHelvetiker);

            THREE.FontUtils.loadFace(ThreeHelvetiker);
            shapes = THREE.FontUtils.generateShapes(vals.text, {
                font: "helvetiker",
                //weight: "normal",
                size: vals.size ? vals.size : 10
            });
            geom = new THREE.ShapeGeometry(shapes);
            mat = new THREE.MeshBasicMaterial({
                color: vals.color,
                transparent: true,
                opacity: 0.8
            });
            mesh = new THREE.Mesh(geom, mat);

            mesh.position.x = vals.x;
            mesh.position.y = vals.y;
            mesh.position.z = vals.z;

            return mesh;


        },
        makeSpriteOld: function(vals) {
            //create image
            var bitmap = document.createElement('canvas');
            var g = bitmap.getContext('2d');
            bitmap.width = 100;
            bitmap.height = 100;
            g.font = 'Bold 20px Arial';

            g.fillStyle = 'white';
            g.fillText(vals.text, 0, 20);
            //g.strokeStyle = 'black';
            //g.strokeText(text, 0, 20);

            // canvas contents will be used for a texture
            var texture = new THREE.Texture(bitmap);
            texture.needsUpdate = true;
        },
        makeSprite2: function(vals) {
            var rendererType = "webgl";
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                metrics = null,
                textHeight = 20,
                textWidth = 0,
                actualFontSize = 10;
            var txt = vals.text;
            if (vals.size) actualFontSize = vals.size;

            context.font = "normal " + textHeight + "px Arial";
            metrics = context.measureText(txt);
            var textWidth = metrics.width;

            canvas.width = textWidth;
            canvas.height = textHeight;
            context.font = "normal " + textHeight + "px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            //context.fillStyle = "#ff0000";
            context.fillStyle = vals.color;

            context.fillText(txt, textWidth / 2, textHeight / 2);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var textObject = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width, canvas.height),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                }));
            textObject.position.x = vals.x;
            textObject.position.y = vals.y;
            textObject.position.z = vals.z;

            /*
            var material = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: true
            });
            material.transparent = true;
            var textObject = new THREE.Object3D();
            textObject.position.x = vals.x;
            textObject.position.y = vals.y;
            textObject.position.z = vals.z;
            var sprite = new THREE.Sprite(material);
            textObject.textHeight = actualFontSize;
            textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
            if (rendererType == "2d") {
                sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
            } else {
                sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
            }
            
            textObject.add(sprite);
            */

            //scene.add(textObject);
            return textObject;
        },
        createText: function(text) {


            var height = 2,
                size = 70,
                hover = 30,

                curveSegments = 4,

                bevelThickness = 2,
                bevelSize = 1.5,
                bevelSegments = 3,
                bevelEnabled = false,

                font = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
                weight = "normal", // normal bold
                style = "normal"; // normal italic

            var mirror = false;

            var material = new THREE.MeshFaceMaterial([
                new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading }), // front
                new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.SmoothShading }) // side
            ]);

            var group = new THREE.Object3D();
            group.position.y = -10;

            //scene.add( group );

            var textGeo = new THREE.TextGeometry(text, {

                size: size,
                height: height,
                curveSegments: curveSegments,

                font: font,
                weight: weight,
                style: style,

                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: bevelEnabled,

                material: 0,
                extrudeMaterial: 1

            });

            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();

            // "fix" side normals by removing z-component of normals for side faces
            // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

            if (!bevelEnabled) {

                var triangleAreaHeuristics = 0.1 * (height * size);

                for (var i = 0; i < textGeo.faces.length; i++) {

                    var face = textGeo.faces[i];

                    if (face.materialIndex == 1) {

                        for (var j = 0; j < face.vertexNormals.length; j++) {

                            face.vertexNormals[j].z = 0;
                            face.vertexNormals[j].normalize();

                        }

                        var va = textGeo.vertices[face.a];
                        var vb = textGeo.vertices[face.b];
                        var vc = textGeo.vertices[face.c];

                        var s = THREE.GeometryUtils.triangleArea(va, vb, vc);

                        if (s > triangleAreaHeuristics) {

                            for (var j = 0; j < face.vertexNormals.length; j++) {

                                face.vertexNormals[j].copy(face.normal);

                            }

                        }

                    }

                }

            }

            var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

            var textMesh1 = new THREE.Mesh(textGeo, material);

            textMesh1.position.x = centerOffset;
            textMesh1.position.y = hover;
            textMesh1.position.z = 0;

            textMesh1.rotation.x = 0;
            textMesh1.rotation.y = Math.PI * 2;

            group.add(textMesh1);

            if (mirror) {

                textMesh2 = new THREE.Mesh(textGeo, material);

                textMesh2.position.x = centerOffset;
                textMesh2.position.y = -hover;
                textMesh2.position.z = height;

                textMesh2.rotation.x = Math.PI;
                textMesh2.rotation.y = Math.PI * 2;

                group.add(textMesh2);

            }

            return group;

        },
        forkSetup: function() {
            var topCssSelector = '#' + this.id;

            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            var that = this;
            chilipeppr.load("http://raw.githubusercontent.com/rixnco/widget-pubsubviewer/master/auto-generated-widget.html", function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($(topCssSelector + ' .panel-heading .dropdown .dropdown-menu'), that);
                });
            });
        },
        interPolator: (function() {
            var interpolatorDebug = false;
            var originalGCode = [];
            var input = [];
            var output = [];
            var maxDistance = 5;
            var lineCounter = 0;
            var mapping = [];
            var addMapping = function(codeNum, elem, o) {
                if (typeof mapping[codeNum] == "undefined") {
                    mapping[codeNum] = {original:o, rewritten: []};
                }
				if(elem != ''){
					mapping[codeNum].rewritten.push(elem);
				}
            };

			var outputMapping = function(){
				var t = $('<table></table>');
				var tr = $('<tr><td class="index"></td><td class="originalElement"></td><td class="replacementElement"></td></tr>');
				
				mapping.forEach(function(elem, index){
					var row = $(tr).clone(true);
					row.find('.index').text(index);
					row.find('originalElement').text(elem.original);
					row.find('replacementElement').text(elem.rewritten.join("<br/>\n"));
					row.appendTo(t);
				});
				
				var w = window.open();
				$(w.document.body).html(t);
			};
            var parseGcode = function() {
                var curPos = { x: 0, y: 0, z: 0 };
                var lastCommand = '';
                var feedRate = 0;
                var command = new RegExp("(G\\s*(0|1|2|3)+)", 'i');
                var coord = {
                    x: new RegExp("X\\s*(-?\\d+)", 'i'),
                    y: new RegExp("Y\\s*(-?\\d+)", 'i'),
                    z: new RegExp("Z\\s*(-?\\d+)", 'i')
                };
                var offset = {
                    i: new RegExp("I\\s*(-?\\d+)", 'i'),
                    j: new RegExp("J\\s*(-?\\d+)", 'i'),
                    k: new RegExp("K\\s*(-?\\d+)", 'i')
                };
                var feedrate = new RegExp("F\\s*(\\d+)", 'i');
                var radius = new RegExp("R\\s*(\\d+)", 'i');
                var comment = new RegExp("(\\(.*?\\))");
                var lineNumber = new RegExp("N\\s*\\d*", "i");
                var end = {};
                var oCodeNum = -1;
                var originalElement = '';
                var safeZ = parseFloat($('.high-z').val());
				var mapping = [];

                input.forEach(function(elem) {
					oCodeNum++;
                    addMapping(oCodeNum, elem);
					var result;
                    var comments = [];
                    elem = elem.trim();
                    elem = elem.replace(lineNumber, '');
                    originalElement = elem;
                    var hasFeedrate = false;
                    var hasCommand = false;
                    var hasComment = false;
                    if (comment.test(elem)) {
                        hasComment = true;
                        var counter = 1;
                        var _comments = comment.exec(elem);
                        while (_comments && counter < 10) {
                            comments.push(_comments[1]);
                            elem = elem.replace(_comments[1], '^' + counter);
                            counter++;
                            _comments = comment.exec(elem);
                        }
                    }
                    if (command.test(elem)) {
                        result = command.exec(elem);
                        //get rid of intermediate spaces
                        result[1] = result[1].replace(' ', '');
                        lastCommand = result[1].toUpperCase();
                        hasCommand = true;
                    }
                    if (feedrate.test(elem)) {
                        result = feedrate.exec(elem);
                        feedRate = makeNumeric(elem[1]);
                        hasFeedrate = true;
                    }
                    var hasCoords = false;
                    var clockwise = false;
                    switch (lastCommand) {
                        case 'G0':
                        case 'G00':
                        case 'G1':
                        case 'G01':
                            ['x', 'y', 'z'].forEach(function(e, index, that) {
                                if (coord[e].test(elem)) {
                                    var result = coord[e].exec(elem);
                                    end[e] = makeNumeric(result[1]);
                                    hasCoords = true;
                                }
                                else {
                                    end[e] = curPos[e];
                                }
                            }, this);
                            if (hasCoords) {
                                if (typeof end.z != "undefined" && typeof curPos.z != "undefined" && end.z - curPos.z >= safeZ) {
                                    output.push("N" + lineCounter + " " + originalElement);
                                    addMapping(oCodeNum, originalElement);
                                    lineCounter++;
                                }
                                else {
                                    var rValue = interpolateLine(curPos, end, feedrate);
                                    if (rValue === false) {
                                        output.push("N" + lineCounter + " " + elem);
                                        addMapping(oCodeNum, elem);
                                        lineCounter++;
                                    }
                                    else {
                                        for (var i = 0; i < rValue.length; i++) {
                                            var item = rValue[i];
                                            if (hasCommand) {
                                                item = lastCommand + " " + item;
                                            }
                                            if (hasFeedrate) {
                                                item = item + " F" + feedrate;
                                            }
                                            if (hasComment && i == 0) {
                                                comments.forEach(function(c, j) {
                                                    item = item.replace('^' + (j + 1), c);
                                                });
                                                comments = [];
                                            }
                                            output.push("N" + lineCounter + " " + item);
                                            addMapping(oCodeNum, item);
                                            lineCounter++;
                                        }
                                    }
                                }
                            }
                            else {
                                output.push("N" + lineCounter + " " + originalElement);
                                addMapping(oCodeNum, originalElement);
                                lineCounter++;
                            }
                            curPos = end;
                            end = {};
                            break;

                        case 'G2':
                        case 'G02':
                            var clockwise = true;
                        case 'G3':
                        case 'G03':
                            ['x', 'y', 'z'].forEach(function(e, index, that) {
                                if (coord[e].test(elem)) {
                                    var result = coord[e].exec(elem);
                                    end[e] = makeNumeric(result[1]);
                                    hasCoords = true;
                                }
                                else {
                                    end[e] = curPos[e];
                                }
                            }, this);
                            var hasOffset = false;
                            var offsets = [];
                            ['i', 'j', 'k'].forEach(function(e, index, that) {
                                if (offset[e].test(elem)) {
                                    var result = offset[e].exec(elem);
                                    offsets[e] = makeNumeric(result[1]);
                                    hasOffset = true;
                                }
                                else {
                                    offsets[e] = 0;
                                }
                            }, this);
                            if (!hasCoords && !hasOffset) {
                                output.push("N" + lineCounter + " " + originalElement);
                                addMapping(oCodeNum, originalElement);
                                lineCounter++;
                            }
                            else {
                                if (hasCoords && typeof end.z != "undefined" && typeof curPos.z != "undefined" && end.z - curPos.z >= safeZ) {
                                    output.push("N" + lineCounter + " " + originalElement);
                                    addMapping(oCodeNum, originalElement);
                                    lineCounter++;
                                }
                                else {
                                    var hasRadius = false;
                                    if (!hasOffset) {
                                        if (radius.test(elem)) {
                                            var rr = radius.exec(elem);
                                            var Radius = makeNumeric(rr[1]);
                                            hasRadius = true;
                                            //interpolate arc with radius
                                        }
                                        else {
                                            output.push("N" + lineCounter + " " + originalElement); //don't know what to do so give up
                                            addMapping(oCodeNum, originalElement);
                                            lineCounter++;
                                        }
                                    }
                                    else {
                                        if (hasCoords) {
                                            var rValue = interpolateArc(curPos, end, offsets, clockwise);
                                            if (rValue === false) {
                                                output.push("N" + lineCounter + " " + originalElement);
                                                addMapping(oCodeNum, originalElement);
                                                lineCounter++;
                                            }
                                            else {
                                                rValue.forEach(function(e, index) {
                                                    if (hasFeedrate && index == 0) {
                                                        e = e + " F" + feedRate;
                                                    }

                                                    if (hasComment && index == 0) {
                                                        comments.forEach(function(c, i) {
                                                            e = e.replace('^' + (i + 1), c);
                                                        });
                                                        comments = [];
                                                    }
                                                    output.push("N" + lineCounter + " " + e);
                                                    addMapping(oCodeNum, e);
                                                    lineCounter++;
                                                });
                                            }
                                        }
                                        else {
                                            //is a circle
                                            console.log('is a circle');
                                            end = curPos; //need this for later
                                            var rValue = interpolateCircle(curPos, offsets, clockwise);
                                            if (rValue === false) {
                                                output.push("N" + lineCounter + " " + originalElement);
                                                addMapping(oCodeNum, originalElement);
                                                lineCounter++;
                                            }
                                            else {
                                                rValue.forEach(function(e, index) {
                                                    if (hasFeedrate && index == 0) {
                                                        e = e + " F" + feedRate;
                                                    }

                                                    if (hasComment && index == 0) {
                                                        comments.forEach(function(c, i) {
                                                            e = e.replace('^' + (i + 1), c);
                                                        });
                                                        comments = [];
                                                    }
                                                    output.push("N" + lineCounter + " " + e);
                                                    addMapping(oCodeNum, e);
                                                    lineCounter++;
                                                });
                                            }

                                        }
                                    }
                                }
                            }
                            curPos = end;
                            end = {};
                            break;
                        default:
                            output.push("N" + lineCounter + " " + originalElement);
                            addMapping(oCodeNum, originalElement);
                            lineCounter++;
                            curPos = end;
                            end = {};
                    }
                });
                if (interpolatorDebug) {
                    console.error('gcode mapping', mapping);
                }
                return output;
            };

            var interpolateLine = function(start, end) {
                var returnArray = [];

                ['x', 'y', 'z'].forEach(function(axis, index, that) {
                    if (typeof end[axis] === "undefined") {
                        end[axis] = start[axis];
                    }
                    else {
                        end[axis] = makeNumeric(end[axis]);
                    }
                }, this);

                var distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

                if (distance > maxDistance) {
                    var intermediateSteps = Math.floor(distance / maxDistance);
                    for (var i = 0; i < intermediateSteps; i++) {
                        returnArray[i] = '';
                        ['x', 'y', 'z'].forEach(function(axis) {
                            var newVal = start[axis] + ((i + 1) * (end[axis] - start[axis]) / intermediateSteps);
                            returnArray[i] = returnArray[i] + axis.toUpperCase() + newVal.toFixed(4) + " ";
                        });
                        returnArray[i] = returnArray[i] + " (added by line interpolator)";
                    };
                    return returnArray;
                }
                else {
                    return false;
                }
            };

            var interpolateCircle = function(start, offset, clockwise) {
                var returnArray = [];
                var origin = {
                    x: start.x + offset.i,
                    y: start.y + offset.j,
                    z: start.z + offset.k
                };

                var radius = Math.sqrt((offset.i * offset.i) + (offset.j * offset.j));
                if (origin.z != start.z) {
                    return false;
                }
                var circumference = Math.PI * 2 * radius;
                var qArc = Math.sqrt(2 * radius * radius);
                if (qArc > maxDistance) {
                    //hmmm
                    /* 
                     easiest is to calculate the angle of the starting point from due north.
                     then create a hemi-circle and interpolate
                    */

                    var topPosition = { x: origin.x, y: origin.y + radius };
                    var topChordLength = Math.sqrt(Math.pow(topPosition.x - start.x, 2) + Math.pow(topPosition.y - start.y, 2));
                    var topAngle = 2 * Math.asin(topChordLength / (2 * radius));
                    if (clockwise) {
                        var oppositeAngle = topAngle + Math.PI; //find inverse angle
                    }
                    else {
                        var oppositeAngle = topAngle - Math.PI;
                    }

                    var x = origin.x + radius * Math.sin(oppositeAngle);
                    var y = origin.y + radius * Math.cos(oppositeAngle);
                    //console.warning('x',x,'y',y);      	
                    var temp;
                    temp = interpolateArc(start, { x: x, y: y, z: start.z }, offset, clockwise);
                    if (temp !== false) {
                        returnArray = returnArray.concat(temp);
                    }
                    offset.i = -1 * offset.i;
                    offset.j = -1 * offset.j;

                    var temp2 = interpolateArc({ x: x, y: y, z: start.z }, start, offset, clockwise);
                    if (temp2 !== false) {
                        returnArray = returnArray.concat(temp2);
                    }
                    return returnArray;
                }
                else {
                    return false;
                }

            };

            var interpolateArc = function(start, end, offset, clockwise) {
                ['x', 'y', 'z'].forEach(function(axis, index, that) {
                    if (typeof end[axis] === "undefined") {
                        end[axis] = start[axis];
                    }
                    else {
                        end[axis] = makeNumeric(end[axis]);
                    }
                }, this);


                var returnArray = [];
                var origin = {
                    x: start.x + offset.i,
                    y: start.y + offset.j,
                    z: start.z + offset.k
                };

                var radius = Math.sqrt((offset.i * offset.i) + (offset.j * offset.j));
                if (origin.z != start.z) return false;
                var circumference = Math.PI * 2 * radius;
                var chordLength = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                var segmentAngle = 2 * (Math.asin(chordLength / (2 * radius)));
                var arcLength = circumference * segmentAngle / (2 * Math.PI);
                if (arcLength > maxDistance) {
                    var intermediateSteps = Math.floor(arcLength / maxDistance);
                    //we need the angle from the vertical
                    var topPosition = { x: origin.x, y: origin.y + radius };
                    var topChordLength = Math.sqrt(Math.pow(topPosition.x - start.x, 2) + Math.pow(topPosition.y - start.y, 2));
                    var topAngle = 2 * Math.asin(topChordLength / (2 * radius));

                    if (start.x < origin.x) {
                        topAngle = Math.PI + topAngle;
                    }
                    for (var j = 0; j < intermediateSteps; j++) {
                        if (clockwise) {
                            var angle = topAngle + ((j + 1) * segmentAngle / intermediateSteps);
                        }
                        else {
                            var angle = topAngle - ((j + 1) * segmentAngle / intermediateSteps);
                        }
                        if (angle >= 2 * Math.PI) {
                            angle = angle - (2 * Math.PI);
                        }
                        var x = origin.x + radius * Math.sin(angle);
                        var y = origin.y + radius * Math.cos(angle);
                        var z = start.z + (((end.z - start.z) / intermediateSteps) * (j + 1));
                        var str = "X" + x.toFixed(4) + " Y" + y.toFixed(4) + " Z" + z.toFixed(4) + " R" + radius.toFixed(4) + " (added by arc interpolator)";
                        if (clockwise) {
                            returnArray.push("G2 " + str);
                        }
                        else {
                            returnArray.push("G3 " + str);
                        }
                    }
                    return returnArray;
                }
                return false;
            };
            var makeNumeric = function(variable) {
                if (typeof variable == "number") return variable;
                if (isNaN(variable)) return false;
                return parseFloat(variable);
            };
            var extractGCode = function() {
                console.error(originalGCode);
                originalGCode.userData.lines.forEach(function(item) {
                    if ('origtext' in item.args) {
                        input.push(item.args.origtext);
                    }
                    else if ('text' in item.args) {
                        input.push(item.args.text);
                    }
                });
            };

            return {
                interpolate: function(gcode, _maxDistance, _interpolatorDebug) {
                    originalGCode = gcode;
                    interpolatorDebug = typeof _interpolatorDebug == "boolean" ? interpolatorDebug : true; //for debugging only       
                    if (typeof _maxDistance == "number") {
                        maxDistance = _maxDistance;
                    }
                    extractGCode();
                    parseGcode();
                    return output;
                }
            };
        })()
    };
});
