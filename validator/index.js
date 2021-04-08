exports.userSignupValidator = (req,res, next) =>{
    console.log(req.body)
    req.check('name','Name is required').notEmpty()
    req.check('email', 'Email must be between 6 to 100 characters').matches(/.+\@.+\..+/).withMessage("Email must contain @").isLength({min:6, max:100})
    req.check('password','Password is requierd').notEmpty()
    req.check('password').isLength({min:6}).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage("Password must contain a number")


    const errors = req.validationErrors()
    if (errors){
        
        const firstError = errors.map(error => error.msg)[0]
        
        return res.status(402).json({error:firstError})
    }

    next()
}