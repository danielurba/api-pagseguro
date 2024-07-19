require('dotenv').config();
const axios = require('axios');

module.exports = app => {
    const createPublicKey = async (req, res) => {
        try {
            const response = await axios.get(`${process.env.BASE_URL}/public-keys/card`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TOKEN}`,
                    'accept': '*/*',
                }
            });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json(error.response ? error.response.data : error.message);
        }
    }

    return { createPublicKey }
}