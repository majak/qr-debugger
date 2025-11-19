import jsQR from 'jsqr';

// Format Information Mask (101010000010010)
const FORMAT_INFO_MASK = 0x5412;

// Capacity table (Simplified for common cases or I can include a larger one)
// Format: [Version][EC_Level] = MaxBytes
// EC Levels: L=0, M=1, Q=2, H=3 (Matches standard 2-bit int)
// Just a small subset for demo or a helper function to approximate? 
// Actually, let's just use a small lookup for common versions or maybe just show "Version X (WxH)"
// Better yet, let's just return the raw data we have and maybe a "Module Size" estimate.

export const processQR = (imageData, width, height) => {
    const code = jsQR(imageData, width, height);

    if (!code) {
        return null;
    }

    const { version, location, chunks, binaryData, data } = code;
    const dimension = version * 4 + 17;

    // Calculate approximate module size in pixels
    // Distance between TopLeft and TopRight finder patterns
    const dx = location.topRightCorner.x - location.topLeftCorner.x;
    const dy = location.topRightCorner.y - location.topLeftCorner.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // In module units, this distance is (dimension - 7)
    const moduleSizePx = dist / (dimension - 7);

    // Extract advanced info
    // We reuse the logic but now we have the real code object

    // Helper to sample a module (re-implemented inside or reused)
    // For format info, we need the raw image data again.

    // We need to reconstruct the "getModule" context.
    // ... (Previous logic for perspective transform) ...

    // Let's simplify and just use the `code` object where possible, 
    // but we still need to re-run the format extraction because jsQR doesn't give us the raw Mask Pattern index directly (it applies it but doesn't say which one it was in the public API usually, wait, search said it might not).
    // Search said jsQR returns version. It does NOT explicitly return mask pattern in the top level object.
    // So we MUST keep our custom extraction logic.

    const transform = getPerspectiveTransform(location, dimension);

    const getModule = (col, row) => {
        const { x, y } = transformPoint(transform, col + 0.5, row + 0.5);
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        if (ix < 0 || ix >= width || iy < 0 || iy >= height) return 0;
        const offset = (iy * width + ix) * 4;
        const gray = (imageData[offset] + imageData[offset + 1] + imageData[offset + 2]) / 3;
        return gray < 128 ? 1 : 0;
    };

    const formatInfo = readFormatInfo(getModule, dimension);

    return {
        data,
        binaryData,
        chunks,
        version,
        location,
        dimension,
        moduleSizePx: moduleSizePx.toFixed(2),
        maskPattern: formatInfo.maskPattern,
        ecLevel: formatInfo.ecLevel,
        formatBits: formatInfo.bits
    };
};

// ... (Keep existing helper functions: getPerspectiveTransform, transformPoint, readFormatInfo)

function getPerspectiveTransform(location, dim) {
    const x0 = location.topLeftCorner.x;
    const y0 = location.topLeftCorner.y;
    const x1 = location.topRightCorner.x;
    const y1 = location.topRightCorner.y;
    const x2 = location.bottomRightCorner.x;
    const y2 = location.bottomRightCorner.y;
    const x3 = location.bottomLeftCorner.x;
    const y3 = location.bottomLeftCorner.y;

    return {
        transform: (u, v) => {
            const nu = u / dim;
            const nv = v / dim;
            const x = (1 - nu) * (1 - nv) * x0 + nu * (1 - nv) * x1 + nu * nv * x2 + (1 - nu) * nv * x3;
            const y = (1 - nu) * (1 - nv) * y0 + nu * (1 - nv) * y1 + nu * nv * y2 + (1 - nu) * nv * y3;
            return { x, y };
        }
    };
}

function transformPoint(t, u, v) {
    return t.transform(u, v);
}

function readFormatInfo(getModule, dim) {
    let bits = 0;
    // Read bits 0-14 (Format Info is 15 bits)
    // The format info is around the Top-Left finder pattern.
    // Vertical strip (left of TL finder):
    // (8,0), (8,1)...(8,5), (8,7), (8,8) -> Bits 0-7 (roughly, order matters)
    // Horizontal strip (bottom of TL finder):
    // (8,8), (7,8), (5,8)...(0,8) -> Bits 8-14

    // Correct Order (MSB to LSB): 14,13,12,11,10,9,8,7,6,5,4,3,2,1,0
    // Map to coordinates:
    // 14: (8, 0)
    // 13: (8, 1)
    // 12: (8, 2)
    // 11: (8, 3)
    // 10: (8, 4)
    // 9:  (8, 5)
    // 8:  (8, 7)  <-- Skip (8,6) which is timing pattern
    // 7:  (8, 8)  <-- Corner
    // 6:  (7, 8)
    // 5:  (5, 8)  <-- Skip (6,8) which is timing pattern
    // 4:  (4, 8)
    // 3:  (3, 8)
    // 2:  (2, 8)
    // 1:  (1, 8)
    // 0:  (0, 8)

    bits |= (getModule(8, 0) << 14);
    bits |= (getModule(8, 1) << 13);
    bits |= (getModule(8, 2) << 12);
    bits |= (getModule(8, 3) << 11);
    bits |= (getModule(8, 4) << 10);
    bits |= (getModule(8, 5) << 9);
    bits |= (getModule(8, 7) << 8);
    bits |= (getModule(8, 8) << 7);
    bits |= (getModule(7, 8) << 6);
    bits |= (getModule(5, 8) << 5);
    bits |= (getModule(4, 8) << 4);
    bits |= (getModule(3, 8) << 3);
    bits |= (getModule(2, 8) << 2);
    bits |= (getModule(1, 8) << 1);
    bits |= (getModule(0, 8) << 0);

    const masked = bits ^ FORMAT_INFO_MASK;
    const ecLevelBits = (masked >> 13) & 0x3;
    const maskPattern = (masked >> 10) & 0x7;

    const ecLevels = { 0: 'M', 1: 'L', 2: 'H', 3: 'Q' };

    return {
        bits: bits,
        ecLevel: ecLevels[ecLevelBits],
        maskPattern: maskPattern
    };
}
