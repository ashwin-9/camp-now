const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');

const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    createdAt: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

campgroundSchema.virtual('properties.popUp').get(function () {
    const str = `/campgrounds/${this._id}`;
    return `<strong><a href=${str}>${this.title}</a></strong><p>${this.description.substring(0, 30)}...</p>`;
})

//Mongoose middleware to delete all reviews when a campground is deleted
campgroundSchema.post('findOneAndDelete', async function (campground) {
    await Review.deleteMany({
        _id: { $in: campground.reviews }
    })
})

module.exports = mongoose.model('Campground', campgroundSchema);