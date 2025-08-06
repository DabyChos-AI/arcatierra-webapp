import fs from 'fs/promises';
import path from 'path';

const revertImages = async () => {
  const productsFilePath = path.join(__dirname, '../src/data/productos.ts');
  const placeholderImage = '/images/placeholder-product.jpg';

  try {
    let fileContent = await fs.readFile(productsFilePath, 'utf-8');

    // Regex to find image properties with pexels or google drive URLs and replace them
    const regex = /"imagen": "https:\/\/(images\.pexels\.com|drive\.google\.com)[^"]*"/g;

    fileContent = fileContent.replace(regex, `"imagen": "${placeholderImage}"`);

    await fs.writeFile(productsFilePath, fileContent);
    console.log('Successfully reverted product images in productos.ts');
  } catch (error) {
    console.error('Error reverting images:', error);
  }
};

revertImages();
