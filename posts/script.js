const canvas = document.getElementById("canvas") || document.createElement("canvas");
if (!document.body.contains(canvas)) {
    document.body.appendChild(canvas);
}
const ctx = canvas.getContext("2d");

let width = window.innerWidth || 800;
let height = window.innerHeight || 600;

function initCanvas() {
    width = window.innerWidth || document.documentElement.clientWidth || 800;
    height = window.innerHeight || document.documentElement.clientHeight || 600;
    canvas.width = width;
    canvas.height = height;
}
initCanvas();

const mouse = {
    x: width / 2,
    y: height / 2
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}, { passive: true });

function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

let webSpokes = [];
let webRings = [];
let dewDrops = [];
let frame = 0;

function generateWeb() {
    webSpokes = [];
    webRings = [];
    dewDrops = [];

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height) * 0.85;
    const numSpokes = 16;

    for (let i = 0; i < numSpokes; i++) {
        let angle = (i / numSpokes) * Math.PI * 2 + 0.05;
        webSpokes.push({
            angle: angle,
            endX: centerX + Math.cos(angle) * maxRadius,
            endY: centerY + Math.sin(angle) * maxRadius
        });
    }

    const numRings = 9;
    for (let r = 1; r <= numRings; r++) {
        let radius = (r / numRings) * (Math.min(width, height) * 0.48);
        let ringPoints = [];

        for (let i = 0; i < numSpokes; i++) {
            let angle = webSpokes[i].angle;
            let sag = Math.sin((i / numSpokes) * Math.PI * 4) * 4;
            let px = centerX + Math.cos(angle) * (radius + sag);
            let py = centerY + Math.sin(angle) * (radius + sag);

            ringPoints.push({ x: px, y: py, baseRadius: radius });
            if (Math.random() < 0.35) {
                dewDrops.push({
                    x: px + (Math.random() - 0.5) * 6,
                    y: py + (Math.random() - 0.5) * 6,
                    size: Math.random() * 2 + 1,
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        webRings.push(ringPoints);
    }
}
generateWeb();

window.addEventListener("resize", () => {
    initCanvas();
    generateWeb();
});

function drawWeb() {
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();

    let ambientGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(width, height) * 0.6);
    ambientGrad.addColorStop(0, "rgba(20, 25, 45, 0.4)");
    ambientGrad.addColorStop(1, "rgba(5, 5, 10, 0)");
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.2;

    for (let i = 0; i < webSpokes.length; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(webSpokes[i].endX, webSpokes[i].endY);
        ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;

    for (let r = 0; r < webRings.length; r++) {
        let ring = webRings[r];
        if (!ring || ring.length === 0) continue;

        ctx.beginPath();
        ctx.moveTo(ring[0].x, ring[0].y);
        for (let i = 1; i < ring.length; i++) {
            let prev = ring[i - 1];
            let curr = ring[i];
            let midX = (prev.x + curr.x) / 2;
            let midY = (prev.y + curr.y) / 2 + 2;
            ctx.quadraticCurveTo(midX, midY, curr.x, curr.y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    dewDrops.forEach(drop => {
        let shimmer = 0.4 + Math.sin(frame * 0.05 + drop.phase) * 0.4;
        ctx.fillStyle = `rgba(220, 240, 255, ${shimmer})`;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

class PhotorealisticSpider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.absAngle = 0;
        this.speed = 0;
        this.maxSpeed = 6.5;

        this.carapaceLength = 17;
        this.carapaceWidth = 14;
        this.abdomenLength = 26;
        this.abdomenWidth = 19;

        this.coxaLength = 11;
        this.femurLength = 32;
        this.tibiaLength = 40;

        this.gaitGroupA = [0, 2, 5, 7];
        this.gaitGroupB = [1, 3, 4, 6];
        this.activeGroup = 0;

        const relAngles = [
            -Math.PI * 0.42,
            -Math.PI * 0.68,
            -Math.PI * 1.06,
            -Math.PI * 1.34,
            Math.PI * 0.42,
            Math.PI * 0.68,
            Math.PI * 1.06,
            Math.PI * 1.34
        ];

        const reachScales = [1.6, 1.4, 1.4, 1.6, 1.6, 1.4, 1.4, 1.6];

        this.legs = [];
        for (let i = 0; i < 8; i++) {
            let isLeft = i < 4;
            let ang = relAngles[i];
            let totalReach = (this.coxaLength + this.femurLength + this.tibiaLength) * 0.74 * reachScales[i];

            let fx = this.x + Math.cos(ang) * totalReach;
            let fy = this.y + Math.sin(ang) * totalReach;

            this.legs.push({
                index: i,
                isLeft: isLeft,
                relAngle: ang,
                reach: totalReach,
                fx: fx,
                fy: fy,
                plantX: fx,
                plantY: fy,
                targetX: fx,
                targetY: fy,
                isStepping: false,
                stepProgress: 1.0,
                stepDuration: 5
            });
        }
    }

    update(targetX, targetY) {
        let d = dist(this.x, this.y, targetX, targetY);
        let targetAngle = angleBetween(this.x, this.y, targetX, targetY);

        if (d > 16) {
            let diff = targetAngle - this.absAngle;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            this.absAngle += diff * 0.17;

            this.speed = Math.min(this.maxSpeed, d * 0.085);
            this.x += Math.cos(this.absAngle) * this.speed;
            this.y += Math.sin(this.absAngle) * this.speed;
        } else {
            this.speed *= 0.8;
        }

        let isMoving = this.speed > 0.2;

        let activeLegIndices = this.activeGroup === 0 ? this.gaitGroupA : this.gaitGroupB;
        let anySteppingInActive = activeLegIndices.some(idx => this.legs[idx].isStepping);

        if (!anySteppingInActive && isMoving) {
            this.activeGroup = 1 - this.activeGroup;
            activeLegIndices = this.activeGroup === 0 ? this.gaitGroupA : this.gaitGroupB;
        }

        this.legs.forEach(leg => {
            let baseAngle = this.absAngle + leg.relAngle;
            let lead = isMoving ? this.speed * 3.6 : 0;
            let idealX = this.x + Math.cos(baseAngle) * leg.reach + Math.cos(this.absAngle) * lead;
            let idealY = this.y + Math.sin(baseAngle) * leg.reach + Math.sin(this.absAngle) * lead;

            leg.targetX = idealX;
            leg.targetY = idealY;

            let distToIdeal = dist(leg.fx, leg.fy, leg.targetX, leg.targetY);
            let canStep = activeLegIndices.includes(leg.index);

            if (canStep && !leg.isStepping && (distToIdeal > 22 || (!isMoving && distToIdeal > 34))) {
                leg.isStepping = true;
                leg.stepProgress = 0;
                leg.plantX = leg.fx;
                leg.plantY = leg.fy;
            }

            if (leg.isStepping) {
                leg.stepProgress += 1.0 / leg.stepDuration;
                if (leg.stepProgress >= 1.0) {
                    leg.fx = leg.targetX;
                    leg.fy = leg.targetY;
                    leg.isStepping = false;
                } else {
                    let t = leg.stepProgress;
                    let lx = leg.plantX + (leg.targetX - leg.plantX) * t;
                    let ly = leg.plantY + (leg.targetY - leg.plantY) * t;
                    let lift = -20 * Math.sin(t * Math.PI);

                    leg.fx = lx;
                    leg.fy = ly + lift;
                }
            }
        });
    }

    draw() {
        ctx.save();
        ctx.shadowOffsetX = 12;
        ctx.shadowOffsetY = 15;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(0, 0, 0, 0.85)";

        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 5;

        this.legs.forEach(leg => {
            let baseAngle = this.absAngle + leg.relAngle;
            let hx = this.x + Math.cos(baseAngle) * 10;
            let hy = this.y + Math.sin(baseAngle) * 10;
            let cx = hx + Math.cos(baseAngle) * this.coxaLength;
            let cy = hy + Math.sin(baseAngle) * this.coxaLength;
            let fx = leg.fx;
            let fy = leg.fy;

            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(cx, cy);
            ctx.lineTo(fx, fy);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.arc(this.x, this.y, 14, 0, Math.PI * 2);
        ctx.fill();

        let abdoAngleShadow = this.absAngle + Math.PI;
        let axShadow = this.x + Math.cos(abdoAngleShadow) * 22;
        let ayShadow = this.y + Math.sin(abdoAngleShadow) * 22;
        ctx.beginPath();
        ctx.arc(axShadow, ayShadow, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        this.legs.forEach(leg => {
            let baseAngle = this.absAngle + leg.relAngle;

            let hx = this.x + Math.cos(baseAngle) * 10;
            let hy = this.y + Math.sin(baseAngle) * 10;

            let cx = hx + Math.cos(baseAngle) * this.coxaLength;
            let cy = hy + Math.sin(baseAngle) * this.coxaLength;

            let fx = leg.fx;
            let fy = leg.fy;

            let L2 = this.femurLength;
            let L3 = this.tibiaLength;
            let d = dist(cx, cy, fx, fy);

            let kx, ky;
            if (d >= L2 + L3) {
                let a = angleBetween(cx, cy, fx, fy);
                kx = cx + Math.cos(a) * L2;
                ky = cy + Math.sin(a) * L2;
            } else {
                let angBase = angleBetween(cx, cy, fx, fy);
                let cosAlpha = (L2 * L2 + d * d - L3 * L3) / (2 * L2 * d);
                cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
                let alpha = Math.acos(cosAlpha);

                let sign = leg.isLeft ? -1 : 1;
                let kneeAngle = angBase + alpha * sign;

                kx = cx + Math.cos(kneeAngle) * L2;
                ky = cy + Math.sin(kneeAngle) * L2;
            }

            ctx.strokeStyle = "#12121c";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            ctx.strokeStyle = "#4a4a62";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            let femurGrad = ctx.createLinearGradient(cx, cy, kx, ky);
            femurGrad.addColorStop(0, "#252538");
            femurGrad.addColorStop(0.5, "#12121c");
            femurGrad.addColorStop(1, "#35354a");

            ctx.strokeStyle = femurGrad;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(kx, ky);
            ctx.stroke();

            ctx.strokeStyle = "#8a8aa8";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(kx, ky);
            ctx.stroke();

            let spineAngle = angleBetween(cx, cy, kx, ky) + (leg.isLeft ? 0.8 : -0.8);
            let midFemurX = (cx + kx) / 2;
            let midFemurY = (cy + ky) / 2;

            ctx.strokeStyle = "#aaaaaa";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(midFemurX, midFemurY);
            ctx.lineTo(midFemurX + Math.cos(spineAngle) * 5, midFemurY + Math.sin(spineAngle) * 5);
            ctx.stroke();

            ctx.fillStyle = "#8a8aa8";
            ctx.beginPath();
            ctx.arc(kx, ky, 3, 0, Math.PI * 2);
            ctx.fill();

            let midX = (kx + fx) / 2 + (leg.isLeft ? -7 : 7);
            let midY = (ky + fy) / 2;

            ctx.strokeStyle = "#10101a";
            ctx.lineWidth = 3.8;
            ctx.beginPath();
            ctx.moveTo(kx, ky);
            ctx.quadraticCurveTo(midX, midY, fx, fy);
            ctx.stroke();

            ctx.strokeStyle = "#777799";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(kx, ky);
            ctx.quadraticCurveTo(midX, midY, fx, fy);
            ctx.stroke();
        });

        let abdoAngle = this.absAngle + Math.PI;
        let ax = this.x + Math.cos(abdoAngle) * 24;
        let ay = this.y + Math.sin(abdoAngle) * 24;

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(abdoAngle);

        ctx.fillStyle = "#0c0c14";
        ctx.beginPath();
        ctx.arc(-14, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.scale(1.4, 1.0);

        let abdoGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 18);
        abdoGrad.addColorStop(0, "#555577");
        abdoGrad.addColorStop(0.3, "#252538");
        abdoGrad.addColorStop(0.85, "#0b0b14");
        abdoGrad.addColorStop(1, "#020205");

        ctx.fillStyle = abdoGrad;
        ctx.strokeStyle = "#777799";
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ff1a40";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ff1a40";

        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(2, -4.5);
        ctx.lineTo(7, 0);
        ctx.lineTo(2, 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.absAngle);

        let headGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, this.carapaceLength);
        headGrad.addColorStop(0, "#6a6a8e");
        headGrad.addColorStop(0.4, "#2a2a3e");
        headGrad.addColorStop(0.85, "#10101c");
        headGrad.addColorStop(1, "#040408");

        ctx.fillStyle = headGrad;
        ctx.strokeStyle = "#8888aa";
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.arc(0, 0, this.carapaceLength, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(2, 0);
        ctx.stroke();

        ctx.fillStyle = "#0c0c14";
        ctx.strokeStyle = "#555577";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(13, -3.5, 3.5, 0, Math.PI * 2);
        ctx.arc(13, 3.5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#ff3355";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(14, -4);
        ctx.quadraticCurveTo(19, -4, 18, -1);
        ctx.moveTo(14, 4);
        ctx.quadraticCurveTo(19, 4, 18, 1);
        ctx.stroke();

        let palpTap = Math.sin(frame * 0.12) * 2;
        ctx.strokeStyle = "#9999bb";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(11, -5);
        ctx.lineTo(18, -8 + palpTap);
        ctx.lineTo(23, -5 + palpTap);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(11, 5);
        ctx.lineTo(18, 8 - palpTap);
        ctx.lineTo(23, 5 - palpTap);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(23, -5 + palpTap, 1.2, 0, Math.PI * 2);
        ctx.arc(23, 5 - palpTap, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 6;
        ctx.shadowColor = "#88ccff";
        ctx.fillStyle = "#ffffff";

        ctx.beginPath();
        ctx.arc(12, -2.5, 2.0, 0, Math.PI * 2);
        ctx.arc(12, 2.5, 2.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(12.5, -2.2, 0.8, 0, Math.PI * 2);
        ctx.arc(12.5, 2.2, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 3;
        ctx.shadowColor = "#ffffff";
        ctx.fillStyle = "#ddddee";

        ctx.beginPath();
        ctx.arc(10, -5.5, 1.3, 0, Math.PI * 2);
        ctx.arc(10, 5.5, 1.3, 0, Math.PI * 2);
        ctx.arc(7, -3.5, 1.2, 0, Math.PI * 2);
        ctx.arc(7, 3.5, 1.2, 0, Math.PI * 2);
        ctx.arc(5, -6.0, 1.1, 0, Math.PI * 2);
        ctx.arc(5, 6.0, 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        ctx.restore();
    }
}

const spider = new PhotorealisticSpider(width / 2, height / 2);

function loop() {
    frame++;
    ctx.clearRect(0, 0, width, height);

    drawWeb();
    spider.update(mouse.x, mouse.y);
    spider.draw();

    requestAnimationFrame(loop);
}

loop();
