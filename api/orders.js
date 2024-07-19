require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = app => {
  const createOrder = async (req, res) => {

    if (!req.body) return res.status(400).send('Informar informações da compra!');

    if (
      !req.body.id_course ||
      !req.body.credit_card_bin ||
      !req.body.customerNameData ||
      !req.body.customerEmailData ||
      !req.body.customerCpfData ||
      !req.body.customerPhoneData ||
      !req.body.cardEncrypted ||
      !req.body.cardInstallmentsData
    ) return res.status(400).send('Informações faltando para a compra!');

    const {
      id_course,
      credit_card_bin,
      customerNameData,
      customerEmailData,
      customerCpfData,
      customerPhoneData,
      cardEncrypted,
      cardInstallmentsData
    } = req.body;

    const courses = getCoursesInJson();

    const course = courses.find(p => p.reference_id === id_course);

    if (!course) return res.status(400).send('Curso não encontrado!');

    const creditInstallmentsValue = {
      unit_amount: course.unit_amount,
      installments: course.installments,
      credit_card_bin: credit_card_bin
    }


    const installments = await getInstallmentsFunction(creditInstallmentsValue)

    const cardType = Object.keys(installments.payment_methods.credit_card)[0];

    const installmentPlans = installments.payment_methods.credit_card[cardType].installment_plans

    const selectedPlan = installmentPlans.find(plan => plan.installments === cardInstallmentsData);

    const orderDetails = {
      reference_id: 'ORDER1234',
      customer: {
        name: customerNameData,
        email: customerEmailData,
        tax_id: customerCpfData,
        phones: [{
          country: '55',
          area: 45,
          number: customerPhoneData,
          type: 'MOBILE'
        }]
      },
      items: [{
        reference_id: course.reference_id,
        name: course.name,
        quantity: 1,
        unit_amount: course.unit_amount
      }],
      notification_urls: [
        "https://meusite.com/notificacoes"
      ],
      charges: [{
        reference_id: 'CHARGE1234',
        description: 'Cobrança de Teste',
        amount: selectedPlan.amount,
        payment_method: {
          type: 'CREDIT_CARD',
          installments: cardInstallmentsData,
          capture: true,
          card: {
            encrypted: cardEncrypted,
            store: false,
          },
          holder: {
            name: customerNameData,
            tax_id: customerCpfData
          }
        },
      }],
    };

    try {
      const response = await axios.post(`${process.env.BASE_URL}/orders`, JSON.stringify(orderDetails), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKEN}`,
          'accept': '*/*',
        }
      });

      // console.log(response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json(error.response ? error.response.data : error.message);
    }
  };

  const createOrderPix = async (req, res) => {
    if (!req.body) return res.status(400).send('Informar informações da compra!');

    if (
      !req.body.id_course ||
      !req.body.customerNameData ||
      !req.body.customerEmailData ||
      !req.body.customerCpfData ||
      !req.body.customerPhoneData
    ) return res.status(400).send('Informações faltando para a compra!');

    const {
      id_course,
      customerNameData,
      customerEmailData,
      customerCpfData,
      customerPhoneData
    } = req.body;

    const courses = getCoursesInJson();

    const course = courses.find(p => p.reference_id === id_course);

    if (!course) return res.status(400).send('Curso não encontrado!');

    const firstTwoDigits = customerPhoneData.substring(0, 2);
    const remainingDigits = customerPhoneData.substring(2);

    const orderDetails = {
      reference_id: 'ORDER1234',
      customer: {
        name: customerNameData,
        email: customerEmailData,
        tax_id: customerCpfData,
        phones: [{
          country: '55',
          area: firstTwoDigits,
          number: remainingDigits,
          type: 'MOBILE'
        }]
      },
      items: [{
        reference_id: course.reference_id,
        name: course.name,
        quantity: 1,
        unit_amount: course.unit_amount
      }],
      notification_urls: [
        "https://meusite.com/notificacoes"
      ],
      qr_codes: [
        {
          amount: {
            value: course.unit_amount
          }
        }
      ]
    };

    try {
      const response = await axios.post(`${process.env.BASE_URL}/orders`, JSON.stringify(orderDetails), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOKEN}`,
          'accept': '*/*',
        }
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      res.status(500).json(error.response ? error.response.data : error.message);
    }
  }

  const getCourse = (req, res) => {
    if (!req.body.id_course) return res.status(400).send('Informar o id do curso!');

    const { id_course } = req.body;

    const courses = getCoursesInJson();

    const course = courses.find(p => p.reference_id === id_course);

    if (!course) return res.status(400).send('Curso não encontrado!');

    if (course) return res.status(200).json(course);

  }

  const getInstallments = async (req, res) => {

    if (!req.body.id_course || !req.body.credit_card_bin) return res.status(400).send('Informar id do Curso/Codigo!');

    const { id_course, credit_card_bin } = req.body;

    const courses = getCoursesInJson();

    const course = courses.find(p => p.reference_id === id_course);

    if (!course) return res.status(400).send('Curso não encontrado!');

    try {
      const response = await axios.get(`${process.env.BASE_URL}/charges/fees/calculate`, {
        params: {
          value: Number(course.unit_amount),
          payment_methods: "CREDIT_CARD",
          max_installments: Number(course.installments),
          max_installments_no_interest: 0,
          credit_card_bin: Number(credit_card_bin),
        },
        headers: {
          'Authorization': `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Erro ao obter opções de parcelamento:', error.response ? error.response.data : error.message);
      return res.status(400).send('Cartão não encontrado!');
    }
  };


  const getTransactionChargesStatus = async (req, res) => {
    const chargeId = req.params.chargeId;
    if (!chargeId) return res.status(400).send('Transaction ID is required.');

    console.log(chargeId)

    try {
      const response = await axios.get(`${process.env.BASE_URL}/charges/${chargeId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });

      console.log(response.data)

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching transaction status:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Error fetching transaction status' });
    }
  };

  const getTransactionOrdesStatus = async (req, res) => {
    const orderId = req.params.orderId;
    if (!orderId) return res.status(400).send('Transaction ID is required.');

    try {
      const response = await axios.get(`${process.env.BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TOKEN}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error fetching transaction status:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Error fetching transaction status' });
    }
  };

  return { createOrder, createOrderPix, getCourse, getInstallments, getTransactionChargesStatus, getTransactionOrdesStatus }
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
    return 'Cartão não encontrado!'
  }
}

function getCoursesInJson() {
  const productsPath = path.join(__dirname, '../jsons-products/products-extensao.json');
  const productsData = fs.readFileSync(productsPath, 'utf8');
  return JSON.parse(productsData);
}