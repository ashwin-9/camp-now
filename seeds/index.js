const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose
    .connect('mongodb://localhost:27017/yelp-camp', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => {
        console.log('Mongo DB Connected!!')
    })
    .catch((err) => {
        console.log('Oh No! Mongo Error!')
        console.log(err)
    })

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]
const userIds = [
    '5fbe2e46f43d271e381f4d31',
    '5fbe741fa3e05b1e908286fc',
    '5fbe749f444c090cc0442aeb',
    '5fbe750bd3bb893350fc491b'
]

const imgs = [
    [
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606553823/YelpCamp/x2uamhdp11fvfsvivbsr.jpg',
            filename: 'YelpCamp/x2uamhdp11fvfsvivbsr.jpg'
        }
    ],
    [
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606388450/YelpCamp/lphaatycyivglagfqgsy.jpg',
            filename: 'YelpCamp/lphaatycyivglagfqgsy'
        },
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606388457/YelpCamp/l5cflg1vwzilwcbxfzg6.jpg',
            filename: 'YelpCamp/l5cflg1vwzilwcbxfzg6'
        },
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606388462/YelpCamp/lbf83marqxlckrgvwgbu.jpg',
            filename: 'YelpCamp/lbf83marqxlckrgvwgbu'
        }
    ],
    [
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606390151/YelpCamp/p87kx284kr5mbyfhli6u.jpg',
            filename: 'YelpCamp/p87kx284kr5mbyfhli6u'
        },
        {
            url:
                'https://res.cloudinary.com/hash09/image/upload/v1606390158/YelpCamp/mjutu4ippmoupfyoraut.jpg',
            filename: 'YelpCamp/mjutu4ippmoupfyoraut'
        }
    ]
]

const seedDB = async () => {
    await Campground.deleteMany()
    for (let i = 0; i < 400; i++) {
        const randInt = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 30
        const date = new Date().toISOString()
        const camp = new Campground({
            location: `${cities[randInt].city}, ${cities[randInt].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [...sample(imgs)],
            description:
                'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ex nostrum cum maxime repellat aspernatur consectetur labore inventore iste porro. Ut ipsum dicta iusto. Veritatis, voluptatem laborum aliquid incidunt reprehenderit laboriosam!',
            price,
            createdAt: date,
            author: sample(userIds),
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randInt].longitude,
                    cities[randInt].latitude
                ]
            }
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
