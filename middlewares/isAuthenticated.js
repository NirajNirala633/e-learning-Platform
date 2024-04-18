module.exports = (req, res, next) => {
    // console.log(req.user);
    if(req.user) {
        next();
    } else {
        return res.json({ authRequired: true, message: "Please Login to continue." })
    }
}