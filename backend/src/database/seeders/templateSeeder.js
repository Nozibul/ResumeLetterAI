// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '../../../.env.local') });

// const mongoose = require('mongoose');
// // const Template = require('../../modules/templates/models/Template');
// const templateData = require('./templateData/templatesData');

// const MONGODB_URI = process.env.MONGODB_URI;

// console.log('MONGODB_URI loaded:', MONGODB_URI);

// const connectDB = async () => {
//   try {
//     if (!MONGODB_URI) {
//       throw new Error('MONGODB_URI is not defined');
//     }
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ MongoDB connected for seeding');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };

// const seedTemplates = async () => {
//   try {
//     console.log('🌱 Starting template seeding...');
//     const deleteCount = await Template.countDocuments();
//     if (deleteCount > 0) {
//       console.log(`⚠️  Found ${deleteCount} existing templates`);
//       const readline = require('readline').createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });
//       await new Promise((resolve) => {
//         readline.question(
//           'Delete existing templates? (yes/no): ',
//           async (answer) => {
//             if (answer.toLowerCase() === 'yes') {
//               await Template.deleteMany({});
//               console.log('🗑️  Deleted existing templates');
//             }
//             readline.close();
//             resolve();
//           }
//         );
//       });
//     }
//     const inserted = await Template.insertMany(templateData);
//     console.log(`✅ Successfully inserted ${inserted.length} templates`);
//     const summary = await Template.aggregate([
//       { $group: { _id: '$category', count: { $sum: 1 } } },
//       { $sort: { _id: 1 } },
//     ]);
//     console.log('\n📊 Templates by category:');
//     summary.forEach((cat) => {
//       console.log(`   ${cat._id}: ${cat.count}`);
//     });
//     console.log('\n🎉 Seeding completed successfully!');
//   } catch (error) {
//     console.error('❌ Seeding error:', error.message);
//     console.error('Stack:', error.stack);
//     process.exit(1);
//   }
// };

// const main = async () => {
//   await connectDB();
//   await seedTemplates();
//   await mongoose.connection.close();
//   console.log('🔌 Database connection closed');
//   process.exit(0);
// };

// main();

// "seed:templates": "node src/database/seeders/templateSeeder.js", // package.json scripts
