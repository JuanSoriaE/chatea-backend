const validateFields = (req, res, next) => {
    try {
        let {username, email} = req.body;

        // Username validation
        const username_regex = /^[a-zA-Z0-9\-]+$/;

        if (!username_regex.test(username)) return res.status(401).json({message: 'The username just can contain this characters: a-z A-Z 0-9 -'});

        // Email validation
        if (email.length > 254) return res.status(401).json({message: 'The email is too long.'});

        let email_parts = email.split('@');

        if (email_parts[0].length > 64) return res.status(401).json({message: 'The email is too long.'});

        let domain_part = email_parts[1].split('.');

        // If one part of the email domain (email.com) is greater than 63, the function will return true and the if condition will read it, if its true, response with error
        if (domain_part.some(part => {return part.length > 63})) return res.status(401).json({message: 'The email domain is too long.'});

        next();
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

module.exports = validateFields;