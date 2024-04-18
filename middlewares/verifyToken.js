const jwt = require('jsonwebtoken');
const { getClient } = require("../config/db");

module.exports = async(req, res, next) => {
    try {
        const client = await getClient();
        const authHeader = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
        // console.log(authHeader);
        if(!authHeader) {
            req.user = null;
            return res.status(401).json({ success: false, authRequired: true, message: 'Invalid authorization' });
        }
        let decodedToken;
        try {
            decodedToken = jwt.verify(authHeader, process.env.JWT_SECRET || "OGebj_*^5?>{N+E=o");
        } catch(err) {
            return res.json({ success: false, authRequired: true, message: "Please Login to continue." })
        }
        if(!decodedToken) {
            return res.json({ success: false, authRequired: true, message: "Please Login to continue." })
        }
        // const user = await User.findById(decodedToken.id);
        const user = await client.query(
            `SELECT * FROM users where user_id = '${decodedToken.id}';`
        );
        // console.log(user);
        if(!user.rows[0]) {
            return res.json({ success: false, authRequired: true, message: "Please Login to continue." })
        }
        req.user = user.rows[0];
        next();
    } catch(error) {
        return res.json({ success: false, authRequired: true, message: "Please Login to continue." })
    }
};