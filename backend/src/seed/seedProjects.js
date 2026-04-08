import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OffsetProject from '../models/OffsetProject.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await OffsetProject.deleteMany({});
    console.log('Cleared existing offset projects');

    const projects = [
      {
        name: 'Amazon Rainforest Conservation',
        description: 'Protect primary rainforest in Brazil from deforestation and support local communities',
        location: 'Brazil',
        price_per_credit: 25.00,
        credits_available: 10000,
        project_type: 'reforestation',
        is_active: true
      },
      {
        name: 'Wind Farm India',
        description: 'Support renewable wind energy generation in Rajasthan to reduce coal dependency',
        location: 'India',
        price_per_credit: 18.50,
        credits_available: 5000,
        project_type: 'renewable_energy',
        is_active: true
      },
      {
        name: 'Ocean Cleanup Initiative',
        description: 'Remove plastic waste and restore marine ecosystems in the Pacific Ocean',
        location: 'Pacific Ocean',
        price_per_credit: 30.00,
        credits_available: 3000,
        project_type: 'carbon_capture',
        is_active: true
      },
      {
        name: 'Community Solar Gardens',
        description: 'Local solar panel installations for underserved communities across the USA',
        location: 'USA',
        price_per_credit: 22.00,
        credits_available: 7500,
        project_type: 'renewable_energy',
        is_active: true
      },
      {
        name: 'African Tree Planting Program',
        description: 'Plant and maintain forests across Sub-Saharan Africa to combat desertification',
        location: 'Kenya',
        price_per_credit: 15.00,
        credits_available: 12000,
        project_type: 'reforestation',
        is_active: true
      }
    ];

    await OffsetProject.insertMany(projects);
    console.log('Seeded 5 offset projects successfully');

    const passwordCleanup = await User.updateMany(
      { password: { $exists: true } },
      { $unset: { password: '' } }
    );
    console.log('Removed legacy password field from users:', passwordCleanup.modifiedCount || 0);

    const addressBackfill = await User.updateMany(
      {
        $or: [
          { 'address.country': { $exists: false } },
          { 'address.city': { $exists: false } }
        ]
      },
      {
        $set: {
          'address.country': 'Unknown',
          'address.city': 'Unknown'
        }
      }
    );
    console.log('Backfilled missing user address fields:', addressBackfill.modifiedCount || 0);

    const existingUser = await User.findOne({ email: 'demo@carbon.com' });
    if (!existingUser) {
      const demoUser = new User({
        email: 'demo@carbon.com',
        name: 'Demo User',
        address: {
          country: 'India',
          city: 'Delhi'
        },
        carbon_balance: 2450
      });
      await demoUser.save();
      console.log('Created demo user: demo@carbon.com');
    } else {
      console.log('Demo user already exists');
    }

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
