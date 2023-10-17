const getToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return null;
        }
        const token = authHeader.split(" ")[1];
        return token;
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = getToken;
