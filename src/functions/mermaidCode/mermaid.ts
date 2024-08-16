import clc from "cli-color";
import { BranchKeyValueItems } from "../../util";
import fs from "fs";

// Helper function to generate a random hex color
function getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function generateMermaidCode(branchPath: string): void {
    const branchcommitsHistoryKeyMap: string | null = fs.readFileSync(branchPath, "utf-8");
    if (!branchcommitsHistoryKeyMap) {
        console.log(clc.yellowBright(`There are no branches !!`));
        return; // Exit early if no branches
    }

    const branches: BranchKeyValueItems = JSON.parse(branchcommitsHistoryKeyMap);

    const mermaidCodeParts: string[] = [];
    const levelMap: { [key: string]: number } = {};
    const colorMap: { [key: number]: string } = {};

    // Helper function to determine levels recursively
    function assignLevels(branch: string, currentLevel: number) {
        if (levelMap[branch] === undefined || levelMap[branch] < currentLevel) {
            levelMap[branch] = currentLevel;
            branches[branch]?.forEach(child => assignLevels(child, currentLevel + 1));
        }
    }
    Object.keys(branches).forEach(root => assignLevels(root, 1));

    // Assign random colors to each level
    Object.values(levelMap).forEach(level => {
        if (!colorMap[level]) {
            colorMap[level] = getRandomColor(); // Assign a random color
        }
    });

    // Build Mermaid diagram code
    mermaidCodeParts.push(`graph LR;`);
    Object.entries(levelMap).forEach(([node, level]) => {
        mermaidCodeParts.push(`classDef level${level} fill:${colorMap[level]},stroke:#333,stroke-width:2px,shape:circle;`);
        mermaidCodeParts.push(`${node}[${node}]:::level${level};`);
    });

    // Add connections
    Object.entries(branches).forEach(([parent, children]) => {
        children.forEach(child => {
            mermaidCodeParts.push(`${parent} --> ${child};`);
        });
    });

    const result = mermaidCodeParts.join('\n');

    console.log(clc.magentaBright(`Paste this code in mermaid editor`))
    console.log(clc.greenBright(result));
}
