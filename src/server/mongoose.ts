import mongoose from 'mongoose';

export default async function (MONGODB_URI: string) {
	process.stdout.write('Connecting to MongoDB database...');

	try {
		const connection = await mongoose.connect(MONGODB_URI);
		process.stdout.write(`\rConnected to ${connection.connection.db.databaseName}                \n`);
	} catch (e) {
		process.stdout.write('\rFailed to connect to MongoDB database\n');
		console.log(e);
		process.exit(1);
	}
}
