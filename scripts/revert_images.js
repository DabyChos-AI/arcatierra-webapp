"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const revertImages = async () => {
    const productsFilePath = path_1.default.join(__dirname, '../src/data/productos.ts');
    const placeholderImage = '/images/placeholder-product.jpg';
    try {
        let fileContent = await promises_1.default.readFile(productsFilePath, 'utf-8');
        // Regex to find image properties with pexels or google drive URLs and replace them
        const regex = /"imagen": "https:\/\/(images\.pexels\.com|drive\.google\.com)[^"]*"/g;
        fileContent = fileContent.replace(regex, `"imagen": "${placeholderImage}"`);
        await promises_1.default.writeFile(productsFilePath, fileContent);
        console.log('Successfully reverted product images in productos.ts');
    }
    catch (error) {
        console.error('Error reverting images:', error);
    }
};
revertImages();
