var canvas = document.querySelector("canvas");
var DEBUG = false;
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (DEBUG) {
        console.log.apply(console, args);
    }
}
var EasyEDADesignHead = /** @class */ (function () {
    function EasyEDADesignHead() {
    }
    return EasyEDADesignHead;
}());
var EasyEDABoundingBox = /** @class */ (function () {
    function EasyEDABoundingBox() {
    }
    return EasyEDABoundingBox;
}());
var EasyEDADesign = /** @class */ (function () {
    function EasyEDADesign() {
    }
    return EasyEDADesign;
}());
var unknown_seen_types = [];
function renderShape(ctx, shape) {
    // "TRACK~1.4~7~~4577.228 3204 4734.975 3204 4758.644 3227.669~gge23155~0",
    // "TRACK~1~10~~4702.0001 3320.85 4702.0001 3893.85~gge24275~0",
    // "TRACK~1~10~~4415.5 3607.3501 4415.5 3213.6497~gge2073~0",
    // "TRACK~1~10~~4415.5 3213.6497 4988.5 3213.6497 4988.5 3607.3501~gge24273~0",
    var type = shape.split("~", 1)[0];
    if (type === "TRACK") {
        var _a = shape.split("~"), command = _a[0], strokeWidth = _a[1], layerID = _a[2], net = _a[3], raw_points_str = _a[4], id = _a[5], _ = _a.slice(6);
        var raw_points_1 = raw_points_str.split(" ");
        var points_4 = [];
        for (var i_1 = 0; i_1 < raw_points_1.length; i_1 += 2) {
            var x_1 = parseFloat(raw_points_1[i_1]);
            var y_1 = parseFloat(raw_points_1[i_1 + 1]);
            points_4.push([x_1, y_1]);
        }
        ctx.beginPath();
        if (layerID === "1") { // TopLayer
            ctx.strokeStyle = "rgb(255,0,255)";
        }
        else if (layerID === "2") { // BottomLayer
            ctx.strokeStyle = "rgb(0,255,0)";
        }
        else if (layerID === "10") { // BoardOutline
            ctx.lineWidth = 4;
        }
        for (var _i = 0, points_1 = points_4; _i < points_1.length; _i++) {
            var point = points_1[_i];
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgb(0,0,0)";
    }
    else if (type === "LIB") {
        var subShapes = shape.split("#@$");
        for (var _b = 0, subShapes_1 = subShapes; _b < subShapes_1.length; _b++) {
            var subShape = subShapes_1[_b];
            if (subShape.split("~", 1)[0] === "LIB") {
                continue;
            }
            renderShape(ctx, subShape);
        }
    }
    else if (type === "HOLE") {
        var _c = shape.split("~"), command = _c[0], center_x = _c[1], center_y = _c[2], diameter = _c[3], id = _c[4], _ = _c.slice(5);
        ctx.beginPath();
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(diameter) / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
    else if (type === "VIA") {
        var _d = shape.split("~"), command = _d[0], center_x = _d[1], center_y = _d[2], diameter = _d[3], net = _d[4], hole_radius = _d[5], id = _d[6], _ = _d.slice(7);
        ctx.beginPath();
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(diameter) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(hole_radius), 0, 2 * Math.PI);
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.stroke();
    }
    else if (type === "TEXT") {
        debug("TEXT not implemented");
    }
    else if (type === "ARC") {
        debug("ARC not implemented");
    }
    else if (type === "CIRCLE") {
        var _e = shape.split("~"), command = _e[0], center_x = _e[1], center_y = _e[2], radius = _e[3], id = _e[4], _ = _e.slice(5);
        ctx.beginPath();
        // TODO: ctx.lineWidth = ???
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(radius), 0, 2 * Math.PI);
        ctx.stroke();
    }
    else if (type === "SOLIDREGION") {
        var _f = shape.split("~"), command = _f[0], layerID = _f[1], net = _f[2], raw_points_str = _f[3], id = _f[4], _ = _f.slice(5);
        var raw_points_2 = raw_points_str.split(" ");
        var points_5 = [];
        for (var i_2 = 0; i_2 < raw_points_2.length; i_2 += 3) {
            var command_1 = raw_points_2[i_2];
            if (command_1 === "A") {
                // Hacks! We could probably implement a proper parser here. Skip
                // the next 3; they don't matter if we don't implement arc below
                i_2 += 5;
            }
            var x_2 = parseFloat(raw_points_2[i_2 + 1]);
            var y_2 = parseFloat(raw_points_2[i_2 + 2]);
            points_5.push({ command: command_1, x: x_2, y: y_2 });
        }
        ctx.beginPath();
        for (var _g = 0, points_2 = points_5; _g < points_2.length; _g++) {
            var point = points_2[_g];
            if (point.command === "M") { // MOVETO (https://www.w3.org/TR/SVG11/paths.html#PathDataGeneralInformation)
                ctx.moveTo(point.x, point.y);
                ctx.fillStyle = "rgba(0,0,0,0.3)";
            }
            else if (point.command === "L") { // LINETO
                ctx.lineTo(point.x, point.y);
            }
            else if (point.command === "Z") { // CLOSEPATH
                ctx.fill();
            }
            else if (point.command === "A") { // ARC
                debug("Arc not implemented; substituting LineTo");
                ctx.lineTo(point.x, point.y);
            }
            else {
                throw "Unknown command " + point.command;
            }
        }
        ctx.fill();
        ctx.fillStyle = "rgb(0,0,0)";
    }
    else if (type === "SVGNODE") {
        debug("SVGNODE not implemented");
    }
    else if (type === "PAD") {
        var _h = shape.split("~"), command = _h[0], pad_type = _h[1], center_x = _h[2], center_y = _h[3], width = _h[4], height = _h[5], layerID = _h[6], net = _h[7], number = _h[8], hole_radius = _h[9], raw_points_str = _h[10], rotation = _h[11], id = _h[12], hole_length = _h[13], hole_points = _h[14], plated = _h[15], _ = _h.slice(16);
        if (hole_length != "0" || hole_points != "") {
            debug("Holes in pads not yet supported");
        }
        if (pad_type === "ELLIPSE") {
            if (width != height) {
                debug("Non-circle ellipses not yet implemented (width " + width + ", height " + height + ")");
                return;
            }
            ctx.beginPath();
            ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(width) / 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
        else if (pad_type === "RECT") {
            var raw_points = raw_points_str.split(" ");
            var points = [];
            for (var i = 0; i < raw_points.length; i += 2) {
                var x = parseFloat(raw_points[i]);
                var y = parseFloat(raw_points[i + 1]);
                points.push([x, y]);
            }
            ctx.beginPath();
            for (var _j = 0, points_3 = points; _j < points_3.length; _j++) {
                var point = points_3[_j];
                ctx.lineTo(point[0], point[1]);
            }
            ctx.fill();
        }
        else if (pad_type === "OVAL") {
            debug([command, pad_type, center_x, center_y, width, height, layerID, net, number, hole_radius, raw_points_str, rotation, id, hole_length, hole_points, plated]);
            debug(pad_type + " PAD not implemented");
        }
        else if (pad_type === "POLYGON") {
            debug(pad_type + " PAD not implemented");
        }
        else {
            debug(pad_type + " PAD not recognized");
        }
    }
    else if (type === "DIMENSION") {
        debug("DIMENSION not implemented");
    }
    else { // We don't know how to handle this
        debug("Unknown type " + type);
        if (unknown_seen_types.indexOf(type) > -1)
            unknown_seen_types.push(type);
    }
}
function updateCanvas(source, canvas) {
    // Ensure canvas size is correct
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    var ctx = canvas.getContext('2d');
    ctx.translate(translatePos.x, translatePos.y);
    ctx.scale(scale, scale);
    var data;
    try {
        data = JSON.parse(source);
    }
    catch (e) {
        ctx.fillText("Error parsing data: " + e, 10, 20);
        return;
    }
    for (var _i = 0, _a = data.shape; _i < _a.length; _i++) {
        var shape = _a[_i];
        renderShape(ctx, shape);
    }
    debug("Unhandled types:", unknown_seen_types);
}
var initialData = JSON.parse(document.querySelector("code").innerHTML);
var translatePos = {
    x: -parseFloat(initialData.head.x),
    y: -parseFloat(initialData.head.y) + canvas.clientHeight / 2
};
var scale = 1.0;
var scaleMultiplier = 1.25;
var startDragOffset = { x: 0, y: 0 };
var mouseDown = false;
// add event listeners to handle screen drag
canvas.addEventListener("mousedown", function (evt) {
    mouseDown = true;
    startDragOffset.x = evt.clientX - translatePos.x;
    startDragOffset.y = evt.clientY - translatePos.y;
});
canvas.addEventListener("mouseup", function (e) { return mouseDown = false; });
canvas.addEventListener("mouseover", function (e) { return mouseDown = false; });
canvas.addEventListener("mouseout", function (e) { return mouseDown = false; });
var input = document.querySelector("code");
canvas.addEventListener("mousemove", function (evt) {
    if (mouseDown) {
        debug("rendering");
        translatePos.x = evt.clientX - startDragOffset.x;
        translatePos.y = evt.clientY - startDragOffset.y;
        debug(translatePos);
        updateCanvas(input.innerText, canvas);
    }
});
// add button event listeners
document.getElementById("zoomIn").addEventListener("click", function () {
    translatePos.x = (translatePos.x - canvas.clientWidth / 2 * scale) * scaleMultiplier + canvas.clientWidth / 2 * scale;
    translatePos.y = (translatePos.y - canvas.clientHeight / 2 * scale) * scaleMultiplier + canvas.clientHeight / 2 * scale;
    scale *= scaleMultiplier;
    updateCanvas(input.innerText, canvas);
}, false);
document.getElementById("zoomOut").addEventListener("click", function () {
    translatePos.x = (translatePos.x - canvas.clientWidth / 2 * scale) / scaleMultiplier + canvas.clientWidth / 2 * scale;
    translatePos.y = (translatePos.y - canvas.clientHeight / 2 * scale) / scaleMultiplier + canvas.clientHeight / 2 * scale;
    scale /= scaleMultiplier;
    updateCanvas(input.innerText, canvas);
}, false);
input.addEventListener("input", function (e) { return updateCanvas(e.target.innerText, canvas); });
// Don't distort on document resize
window.addEventListener("resize", function (e) { return updateCanvas(input.innerText, canvas); });
updateCanvas(input.innerText, canvas);
