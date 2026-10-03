// Populates the database with the same demo catalog the original in-memory
// store shipped with, now properly modeled across three collections.
// Run with: npm run seed  (wipes and re-seeds — local/dev use only).

require("dotenv").config();
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Supplier = require("./models/Supplier");
const Product = require("./models/Product");

const categories = [
  { name: "Keyboards", description: "Keyboards and synthesizers." },
  { name: "Guitars & Bass", description: "Electric and bass guitars." },
  { name: "Drums & Percussion", description: "Drum kits, sticks, and hand percussion." },
  { name: "Brass & Woodwind", description: "Trumpets, saxophones, and related instruments." },
  { name: "Audio Equipment", description: "Speakers, subwoofers, and microphones." },
];

const suppliers = [
  { name: "Yamaha Corp", email: "orders@yamaha.example.com" },
  { name: "Fender Inc", email: "sales@fender.example.com" },
  { name: "Shure Distribution", email: "contact@shure.example.com" },
  { name: "Generic Instrument Co", email: "info@geninstruments.example.com" },
];

// name, price, quantity, category name, supplier name
const products = [
  ["Yamaha Keyboard", 19.99, 50, "Keyboards", "Yamaha Corp"],
  ["Fender Bass Guitar", 59.99, 30, "Guitars & Bass", "Fender Inc"],
  ["Montage Synthesizer", 24.99, 7, "Keyboards", "Yamaha Corp"],
  ["Bellringher Bass Combo", 50.99, 2, "Guitars & Bass", "Generic Instrument Co"],
  ["JBL Speaker", 30.99, 5, "Audio Equipment", "Generic Instrument Co"],
  ["Double UW Subwoofer", 84.99, 4, "Audio Equipment", "Generic Instrument Co"],
  ["2B Drumsticks", 64.99, 50, "Drums & Percussion", "Generic Instrument Co"],
  ["Premier Saxophone", 30.99, 75, "Brass & Woodwind", "Generic Instrument Co"],
  ["Climax Trumpet", 12.99, 73, "Brass & Woodwind", "Generic Instrument Co"],
  ["Shure Microphone", 56.99, 35, "Audio Equipment", "Shure Distribution"],
  ["Conga Drums", 34.99, 15, "Drums & Percussion", "Generic Instrument Co"],
];

async function seed() {
  await connectDB();

  console.log("Clearing existing products, categories, and suppliers…");
  await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Supplier.deleteMany({})]);

  console.log("Inserting categories and suppliers…");
  const categoryDocs = await Category.insertMany(categories);
  const supplierDocs = await Supplier.insertMany(suppliers);

  const categoryIdByName = Object.fromEntries(categoryDocs.map((c) => [c.name, c._id]));
  const supplierIdByName = Object.fromEntries(supplierDocs.map((s) => [s.name, s._id]));

  console.log("Inserting products…");
  for (const [name, price, quantity, categoryName, supplierName] of products) {
    await Product.create({
      name,
      price,
      quantity,
      category: categoryIdByName[categoryName],
      supplier: supplierIdByName[supplierName],
    });
  }

  console.log(`Seeded ${categoryDocs.length} categories, ${supplierDocs.length} suppliers, ${products.length} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
