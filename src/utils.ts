export function lerp(a: number, b: number, t: number) {
    return a * (1.0 - t) + (b * t);
}

export function isInRange(x: number, range: [number, number]): boolean {
    return range[0] < x && x < range[1];
}

export function takeChance(chance: number) {
    return Math.random() <= chance;
}
