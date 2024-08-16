"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMermaidCode = void 0;
const cli_color_1 = __importDefault(require("cli-color"));
const fs_1 = __importDefault(require("fs"));
// Helper function to generate a random hex color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function generateMermaidCode(branchPath) {
    const branchcommitsHistoryKeyMap = fs_1.default.readFileSync(branchPath, "utf-8");
    if (!branchcommitsHistoryKeyMap) {
        console.log(cli_color_1.default.yellowBright(`There are no branches !!`));
        return; // Exit early if no branches
    }
    const branches = JSON.parse(branchcommitsHistoryKeyMap);
    const mermaidCodeParts = [];
    const levelMap = {};
    const colorMap = {};
    // Helper function to determine levels recursively
    function assignLevels(branch, currentLevel) {
        var _a;
        if (levelMap[branch] === undefined || levelMap[branch] < currentLevel) {
            levelMap[branch] = currentLevel;
            (_a = branches[branch]) === null || _a === void 0 ? void 0 : _a.forEach(child => assignLevels(child, currentLevel + 1));
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
    console.log(cli_color_1.default.magentaBright(`Paste this code in mermaid editor`));
    console.log(cli_color_1.default.greenBright(result));
}
exports.generateMermaidCode = generateMermaidCode;
