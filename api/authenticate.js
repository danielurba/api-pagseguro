require('dotenv').config();
const axios = require('axios');

module.exports = app => {
    const getPublicKey = async (req, res) => {
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

    const createPublicKey = async (req, res) => {
        try {
            const response = await axios.post(`${process.env.BASE_URL}/public-keys`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TOKEN}`,
                    'accept': '*/*',
                },
                data: {"type":"card"}
            });

            console.log(response)

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json(error.response ? error.response.data : error.message);
        }
    }

    return { getPublicKey, createPublicKey }
}