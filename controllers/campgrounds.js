const moment = require('moment')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')

//Mapbox Config
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

//Mongo Models
const Campground = require('../models/campground')

//Error Middleware
const ExpressError = require('../utils/ExpressError')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        })
        .send()
    const campground = new Campground(req.body.campground)
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename
    }))
    campground.geometry = geoData.body.features[0].geometry
    campground.createdAt = new Date().toISOString()
    campground.author = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully created a New Campground!🔥')
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find that Campground! 😞')
        return res.redirect('/campgrounds')
    }
    const date = moment(campground.createdAt).fromNow(true)
    campground.createdAt = date
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that Campground! 😞')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    if (!req.body.campground)
        throw new ExpressError('Invalid Campground Data', 400)
    const { id } = req.params
    console.log(req.body)
    req.body.campground.createdAt = new Date().toISOString()
    const campground = await Campground.findByIdAndUpdate(
        id,
        req.body.campground,
        { new: true }
    )
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } }
        })
    }
    await campground.save()
    req.flash('success', 'Successfully updated Campground!🔥')
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully Deleted Campground! 🔥')
    res.redirect('/campgrounds')
}
