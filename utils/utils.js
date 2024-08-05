const path = require('path');
const fs = require('fs');
const axios = require('axios');

module.exports = app => {
    function getCoursesInJson() {
        const productsPath = path.join(__dirname, '../jsons-products/products.json');
        const productsData = fs.readFileSync(productsPath, 'utf8');
        return JSON.parse(productsData);
    }

    function getExpirationDate(hoursToAdd) {
        const date = new Date();
        date.setHours(date.getHours() + hoursToAdd);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const timezoneOffset = -date.getTimezoneOffset();
        const timezoneSign = timezoneOffset >= 0 ? '+' : '-';
        const timezoneHours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, '0');
        const timezoneMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneSign}${timezoneHours}:${timezoneMinutes}`;
    }

    async function getInstallmentsFunction(data) {
        try {
            const response = await axios.get(`${process.env.BASE_URL}/charges/fees/calculate`, {
                params: {
                    value: Number(data.unit_amount),
                    payment_methods: "CREDIT_CARD",
                    max_installments: Number(data.installments),
                    max_installments_no_interest: 0,
                    credit_card_bin: Number(data.credit_card_bin),
                },
                headers: {
                    'Authorization': `Bearer ${process.env.TOKEN}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                }
            });

            return response.data;
        } catch (error) {
            return false
        }
    }

    return { getCoursesInJson, getExpirationDate, getInstallmentsFunction }
}