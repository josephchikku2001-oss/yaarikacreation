import { Product } from '../types';
import cottonSetmundImg from '../assets/images/cotton_setmund_maroon_1787561656351.jpg';
import ajrakhCoordImg from '../assets/images/ajrakh_maroon_coord_1787561846795.jpg';
import offwhiteChuridarImg from '../assets/images/offwhite_flared_churidar_1787561550781.jpg';
import romanSilkImg from '../assets/images/roman_silk_churidar_1787561534662.jpg';
import tissueDhavaniImg from '../assets/images/tissue_dhavani_wine_1787561812613.jpg';
import kasavuFestiveImg from '../assets/images/banner_kerala_kasavu_festive_1787042845226.jpg';
import coordsFusionImg from '../assets/images/banner_contemporary_coords_1787042768365.jpg';
import sareesDesignerImg from '../assets/images/banner_kerala_sarees_designer_1787042820901.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-kasavu-setmund-01',
    title: 'Handloom Kasavu Cotton Set Mundu with Maroon Zari Border',
    category: 'Traditional Sarees',
    price: 1850,
    originalPrice: 2450,
    description: 'Authentic Kerala Handloom pure cotton Set Mundu woven with rich golden kasavu and contrast maroon selvedge. Lightweight, breathable, and gracefully festive for Onam, Vishu, and temple rituals.',
    fabricDetails: '100% Pure Fine Handloom Cotton with Golden Kasavu Weave',
    sizes: ['Free Size'],
    sizeStock: { 'Free Size': 15 },
    stockCount: 15,
    inStock: true,
    featured: true,
    isNewArrival: true,
    imageUrl: cottonSetmundImg,
    images: [cottonSetmundImg, kasavuFestiveImg],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-ajrakh-coord-02',
    title: 'Artisanal Ajrakh Hand-Block Print Modal Silk Co-ord Set',
    category: 'Co-ord Sets',
    price: 2650,
    originalPrice: 3200,
    description: 'Sophisticated contemporary two-piece ensemble handcrafted in deep maroon Ajrakh natural dye motifs. Features relaxed-fit button-down tunic top with matching tailored straight-cut trousers.',
    fabricDetails: 'Breathable Modal Silk with Natural Vegetable Dye Hand-Block Print',
    sizes: ['M', 'L', 'XL', 'XXL'],
    sizeStock: { M: 8, L: 10, XL: 6, XXL: 4 },
    stockCount: 28,
    inStock: true,
    featured: true,
    isNewArrival: true,
    imageUrl: ajrakhCoordImg,
    images: [ajrakhCoordImg, coordsFusionImg],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-anarkali-churidar-03',
    title: 'Ivory Flared Anarkali Churidar Set with Fine Zari Embroidery',
    category: 'Churidar Sets',
    price: 2950,
    originalPrice: 3800,
    description: 'Graceful floor-length flared Anarkali silhouette in classic off-white with delicate golden kasavu neck embroidery, accompanied by a matching organza dupatta and fitted churidar bottom.',
    fabricDetails: 'Chanderi Silk blend with Soft Mulmul Lining and Organza Dupatta',
    sizes: ['M', 'L', 'XL', 'XXL'],
    sizeStock: { M: 6, L: 8, XL: 5, XXL: 3 },
    stockCount: 22,
    inStock: true,
    featured: true,
    isNewArrival: false,
    imageUrl: offwhiteChuridarImg,
    images: [offwhiteChuridarImg],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-roman-silk-suit-04',
    title: 'Imperial Roman Silk Straight-Cut Churidar Suit in Rose Gold',
    category: 'Churidar Sets',
    price: 3450,
    originalPrice: 4200,
    description: 'Lustrous Roman silk kurta crafted with intricate neckline embellishments, paired with tailored pants and a woven Jacquard silk dupatta with tassel accents.',
    fabricDetails: 'Premium Roman Silk with Jacquard Weave Dupatta',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: { S: 3, M: 7, L: 9, XL: 5, XXL: 2 },
    stockCount: 26,
    inStock: true,
    featured: true,
    isNewArrival: true,
    imageUrl: romanSilkImg,
    images: [romanSilkImg],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-tissue-dhavani-05',
    title: 'Regal Golden Tissue Half Saree Dhavani Set in Deep Wine',
    category: 'Fusion Wear',
    price: 4200,
    originalPrice: 5500,
    description: 'Traditional South Indian Pavada Dhavani reinvented with shimmering gold tissue pleats and a rich wine-toned embroidered border. Ideal for bridal showers and festive celebrations.',
    fabricDetails: 'Metallic Golden Tissue Silk with Raw Silk Blouse Fabric',
    sizes: ['Free Size', 'M', 'L'],
    sizeStock: { 'Free Size': 5, M: 4, L: 4 },
    stockCount: 13,
    inStock: true,
    featured: true,
    isNewArrival: true,
    imageUrl: tissueDhavaniImg,
    images: [tissueDhavaniImg],
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-designer-kasavu-06',
    title: 'Kerala Designer Kasavu Saree with Temple Border Motif',
    category: 'Traditional Sarees',
    price: 2150,
    originalPrice: 2800,
    description: 'Signature Kerala traditional handloom saree woven with genuine golden kasavu threads featuring temple architecture motifs and rich pallu finish.',
    fabricDetails: 'Pure Handloom Cotton Kasavu with Unstitched Blouse Piece',
    sizes: ['Free Size'],
    sizeStock: { 'Free Size': 20 },
    stockCount: 20,
    inStock: true,
    featured: true,
    isNewArrival: false,
    imageUrl: kasavuFestiveImg,
    images: [kasavuFestiveImg, sareesDesignerImg],
    createdAt: new Date().toISOString()
  }
];

