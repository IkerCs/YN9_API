import mongoose from 'mongoose';

const schema = new mongoose.Schema({
	profile: Object,
	accessToken: String,
});

export default mongoose.model('User', schema);