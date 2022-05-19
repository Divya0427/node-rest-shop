const jwt = require('jsonwebtoken');
const process = require('../../nodemon.json');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
        /* jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if(err) {
                console.log(`err=>${err}`);
            }
            if(decoded) {
                console.log(`decoded=>${decoded}`);
                req.userData = decoded;
                next();
            }
        }); */
        /* console.log(`decoded value::${decoded}`);
         */
        
    } catch(error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
