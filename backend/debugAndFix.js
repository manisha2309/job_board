const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('applications');

  // Show current state
  const docs = await col.find({}).toArray();
  console.log('\n📋 Current applications:');
  docs.forEach(d => {
    console.log(`  ID: ${d._id}`);
    console.log(`  aiAnalysis: ${JSON.stringify(d.aiAnalysis)}`);
    console.log(`  aiAnalyzedAt: ${d.aiAnalyzedAt}`);
    console.log('  ---');
  });

  // Force clear using raw driver
  const result = await col.updateMany(
    {},
    { $unset: { aiAnalysis: '', aiAnalyzedAt: '' } }
  );
  console.log(`\n✅ Cleared ${result.modifiedCount} documents`);

  // Confirm
  const after = await col.find({}).toArray();
  console.log('\n📋 After clear:');
  after.forEach(d => {
    console.log(`  ID: ${d._id} | aiAnalysis: ${d.aiAnalysis}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ Done! Now restart your backend and try AI Analyze again.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});