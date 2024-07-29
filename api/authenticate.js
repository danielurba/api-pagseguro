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
            app.config.logger.logger.error("Erro ao pegar public key: %0", error.response ? error.response.data : error.message)
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

            res.status(200).json(response.data);
        } catch (error) {
            app.config.logger.logger.error("Erro ao criar public key: %0", error.response ? error.response.data : error.message)
            res.status(500).json(error.response ? error.response.data : error.message);
        }
    }

    return { getPublicKey, createPublicKey }
}