if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoSanitize = require('express-mongo-sanitize')
const methodOverride = require('method-override')
const LocalStrategy = require('passport-local')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const express = require('express')
const helmet = require('helmet')
const path = require('path')

const port = process.env.PORT || 3000
const MongoDBStore = require('connect-mongo')(session)
const secret = process.env.SECRET || 'thisisaverybigsecret'

//Mongo User Model
const User = require('./models/user')

//Error Middlewares
const ExpressError = require('./utils/ExpressError')

//Connecting to Mongo DB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('Mongo DB Connected!!')
    })
    .catch((err) => {
        console.log('Oh No! Mongo Error!')
        console.log(err)
    })

const app = express()

//App config
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(
    mongoSanitize({
        replaceWith: '_'
    })
)

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //seconds
})

store.on('error', (err) => {
    console.log('SESSION STORE ERROR')
})

//Session Config Object
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 //milliseconds
    }
}

app.use(session(sessionConfig))
app.use(helmet())
app.use(flash())

//Helmet Config
const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com/',
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    'https://kit.fontawesome.com/',
    'https://cdnjs.cloudflare.com/',
    'https://cdn.jsdelivr.net'
]

const styleSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/',
    'https://cdn.jsdelivr.net/'
]

const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/'
]

const fontSrcUrls = []

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: [
                "'self'",
                'blob:',
                'data:',
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                'https://images.unsplash.com/'
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        }
    })
)

//Passport Config has to come after session
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

//Storing and removing a user from a session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Middleware for Flash

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//ROUTES
app.get('/', (req, res) => {
    res.render('home')
})

//User Auth Routes
const userRoutes = require('./routes/users')
//Campground Routes
const campgroundRoutes = require('./routes/campgrounds')
//Review Routes
const reviewRoutes = require('./routes/reviews')

//Using Routes
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//Catch All Route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//Error Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(port, (req, res) => {
    console.log(`Serving on port ${port}`)
})
