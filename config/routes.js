module.exports = app => {
    app.post('/create-order', app.api.orders.createOrder)
    app.post('/create-order-pix', app.api.orders.createOrderPix)
    app.post('/get-course', app.api.orders.getCourse)
    app.post('/get-installments', app.api.orders.getInstallments)
    app.get('/get-public-key', app.api.authenticate.createPublicKey)
    app.get('/get-transaction-charges-status/:chargeId', app.api.orders.getTransactionChargesStatus)
    app.get('/get-transaction-orders-status/:orderId', app.api.orders.getTransactionOrdesStatus)
}