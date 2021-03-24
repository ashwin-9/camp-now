//Mongo Models
const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err) return next(err)
            req.flash('success', `Welcome to YelpCamp, ${req.user.username} 🤗`)
            const redirectUrl = req.session.returnTo || '/campgrounds'
            delete req.session.returnTo
            res.redirect(redirectUrl)
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = async (req, res) => {
    req.flash('success', `Welcome Back, ${req.user.username} 🤗`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res) => {
    const { username } = req.user
    req.logOut()
    req.flash('success', `See ya Soon, ${username}! 😊`)
    res.redirect('/campgrounds')
}
