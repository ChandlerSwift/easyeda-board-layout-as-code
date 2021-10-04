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

function renderShape(ctx: CanvasRenderingContext2D, shape: string) {
    // "TRACK~1.4~7~~4577.228 3204 4734.975 3204 4758.644 3227.669~gge23155~0",
    // "TRACK~1~10~~4702.0001 3320.85 4702.0001 3893.85~gge24275~0",
    // "TRACK~1~10~~4415.5 3607.3501 4415.5 3213.6497~gge2073~0",
    // "TRACK~1~10~~4415.5 3213.6497 4988.5 3213.6497 4988.5 3607.3501~gge24273~0",
    let type: string = shape.split("~", 1)[0];
    switch (type) {
        case "TRACK":
            break;
        case "LIB":
            break;
        case "HOLE":
            break;
        default:
            alert(`Unknown type ${type}`);
    }


}

function updateCanvas(source: string, canvas: HTMLCanvasElement) {
    // Ensure canvas size is correct
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');

    let data: EasyEDADesign;
    try {
        data = JSON.parse(source);
    } catch (e) {
        ctx.fillText(`Error parsing data: ${e}`, 10, 20);
        return;
    }
    console.log(`Found ${data.shape.length} shapes`);

    for (let shape of data.shape) {
        renderShape(ctx, shape);
    }
}

let input = document.querySelector("code");
updateCanvas(input.innerText, canvas);

input.addEventListener("input", e => updateCanvas((<HTMLElement>e.target).innerText, canvas));

// Don't distort on document resize
window.addEventListener("resize", e => updateCanvas(input.innerText, canvas));
