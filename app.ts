let canvas = document.querySelector("canvas");

class EasyEDADesignHead {
    docType: string;
    editorVersion: string;
    newgId: boolean;
    c_para: Object;
    x: string;
    y: string;
    hasIdFlag: boolean;
    importFlag: number;
    transformList: string;
}

class EasyEDABoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

class EasyEDADesign {
    head: EasyEDADesignHead;
    canvas: string;
    shape: string[];
    layers: string[];
    objects: string[];
    bbox: EasyEDABoundingBox;
    preference: Object;
    DRCRULE: Object;
    routerRule: Object;
    netColors: Object;
}
let unknown_seen_types = [];
function renderShape(ctx: CanvasRenderingContext2D, shape: string) {
    // "TRACK~1.4~7~~4577.228 3204 4734.975 3204 4758.644 3227.669~gge23155~0",
    // "TRACK~1~10~~4702.0001 3320.85 4702.0001 3893.85~gge24275~0",
    // "TRACK~1~10~~4415.5 3607.3501 4415.5 3213.6497~gge2073~0",
    // "TRACK~1~10~~4415.5 3213.6497 4988.5 3213.6497 4988.5 3607.3501~gge24273~0",
    let type: string = shape.split("~", 1)[0];
    if (type === "TRACK") {
        let [command, strokeWidth, layerID, net, raw_points_str, id, ..._] = shape.split("~");
        let raw_points = raw_points_str.split(" ");
        let points = [];
        for (let i=0; i<raw_points.length; i += 2) {
            let x = parseFloat(raw_points[i]);
            let y = parseFloat(raw_points[i+1]);
            points.push([x, y]);
        }
        ctx.beginPath();
        for (let point of points) {
            ctx.lineTo(point[0], point[1]);
        }
        ctx.stroke();
    } else if (type === "LIB") {
        let subShapes = shape.split("#@$");
        for (let subShape of subShapes) {
            if (subShape.split("~", 1)[0] === "LIB") {
                continue;
            }
            renderShape(ctx, subShape);
        }
    } else if (type === "HOLE") {
        let [command, center_x, center_y, diameter, id, ..._] = shape.split("~");
        ctx.beginPath();
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(diameter)/2, 0, 2*Math.PI);
        ctx.stroke();
    } else if (type === "TEXT") {
        console.log("TEXT not implemented");
    } else if (type === "ARC") {
        console.log("ARC not implemented");
    } else if (type === "CIRCLE") {
        let [command, center_x, center_y, radius, id, ..._] = shape.split("~");
        ctx.beginPath();
        // TODO: ctx.lineWidth = ???
        ctx.arc(parseFloat(center_x), parseFloat(center_y), parseFloat(radius), 0, 2*Math.PI);
        ctx.stroke();
    } else if (type === "SOLIDREGION") {
        let [command, layerID, net, raw_points_str, id, ..._] = shape.split("~");
        let raw_points = raw_points_str.split(" ");
        let points = [];
        for (let i=0; i<raw_points.length; i += 2) {
            let x = parseFloat(raw_points[i]);
            let y = parseFloat(raw_points[i+1]);
            points.push([x, y]);
        }
        ctx.beginPath();
        for (let point of points) {
            ctx.lineTo(point[0], point[1]);
        }
        ctx.fill();
    } else if (type === "SVGNODE") {
        console.log("SVGNODE not implemented");
    } else if (type === "PAD") {
        console.log("PAD not implemented");
    } else if (type === "DIMENSION") {
        console.log("DIMENSION not implemented");
    } else { // We don't know how to handle this
        console.log(`Unknown type ${type}`);
        if (!unknown_seen_types.includes(type))
            unknown_seen_types.push(type);
    }
}

function updateCanvas(source: string, canvas: HTMLCanvasElement) {
    // Ensure canvas size is correct
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    ctx.translate(translatePos.x, translatePos.y);
    ctx.scale(scale, scale);

    let data: EasyEDADesign;
    try {
        data = JSON.parse(source);
    } catch (e) {
        ctx.fillText(`Error parsing data: ${e}`, 10, 20);
        return;
    }

    for (let shape of data.shape) {
        renderShape(ctx, shape);
    }
    console.log("Unhandled types:", unknown_seen_types);
}

let initialData: EasyEDADesign = JSON.parse(document.querySelector("code").innerHTML);

let translatePos = {
    x: -parseFloat(initialData.head.x),
    y: -parseFloat(initialData.head.y) + canvas.clientHeight / 2
};

let scale = 1.0;
let scaleMultiplier = 0.8;
let startDragOffset = {x: 0, y: 0};
let mouseDown = false;

// add event listeners to handle screen drag
canvas.addEventListener("mousedown", function(evt) {
    mouseDown = true;
    startDragOffset.x = evt.clientX - translatePos.x;
    startDragOffset.y = evt.clientY - translatePos.y;
});

canvas.addEventListener("mouseup", e => mouseDown = false);
canvas.addEventListener("mouseover", e => mouseDown = false);
canvas.addEventListener("mouseout", e => mouseDown = false);

let input = document.querySelector("code");

canvas.addEventListener("mousemove", function(evt) {
    if (mouseDown) {
        console.log("rendering");
        translatePos.x = evt.clientX - startDragOffset.x;
        translatePos.y = evt.clientY - startDragOffset.y;
        console.log(translatePos);
        updateCanvas(input.innerText, canvas);
    }
});

// add button event listeners
document.getElementById("zoomIn").addEventListener("click", function() {
    scale /= scaleMultiplier;
    updateCanvas(input.innerText, canvas);
}, false);

document.getElementById("zoomOut").addEventListener("click", function() {
    scale *= scaleMultiplier;
    updateCanvas(input.innerText, canvas);
}, false);

input.addEventListener("input", e => updateCanvas((<HTMLElement>e.target).innerText, canvas));

// Don't distort on document resize
window.addEventListener("resize", e => updateCanvas(input.innerText, canvas));

updateCanvas(input.innerText, canvas);
