import {ConfigIniParser} from "config-ini-parser";

const parser = new ConfigIniParser();

export function loadGameConfig(content: string) {
    parser.parse(content);
}

export function getGameConfig<
    N extends boolean,
>(name: string, isNumber: N): N extends true ? number : string {
    const section = name.split(".")[0].toLowerCase();
    const val = parser.get(section, name, null);
    return isNumber ? parseFloat(val) : String(val) as any;
}
