const express = require('express');
const app = express();
const { postRequest, verify } = require('./service');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const error = (res, code, message) => {
  return res.status(code).send({ code, message });
};

app.post('/', async (req, res) => {
  const reqData = req.body;
  let results = [];

  if (!Array.isArray(reqData)) return error(res, 412, 'INVALID PARAM');

  for (let i = 0; i < reqData.length; i++) {
    const e = reqData[i];

    // transform req
    const reqPayload = {
      account: {
        currency: e.FL_CURRENCY,
        amount: e.FL_AMOUNT,
      },
    };

    // Send request
    const data = await postRequest(e.FL_ACCOUNT, reqPayload);

    // verify signature
    if (!verify(reqPayload, data.signature)) {
      results.push({
        FIN_ACCOUNT: e.FL_ACCOUNT,
        FIN_CURRENCY: e.FL_CURRENCY,
        FIN_DEBIT: 0,
        FIN_CREDIT: 0,
      });
      continue;
    }

    // group credit and debit
    let credit = 0;
    let debit = 0;

    for (let j = 0; j < data.transactions.length; j++) {
      const el = data.transactions[j];

      if (el.type === 'Debit') {
        debit += el.amount;
      }

      if (el.type === 'Credit') {
        credit += el.amount;
      }
    }

    results.push({
      FIN_ACCOUNT: e.FL_ACCOUNT,
      FIN_CURRENCY: e.FL_CURRENCY,
      FIN_DEBIT: credit,
      FIN_CREDIT: debit,
    });
  }

  res.json(results);
});

module.exports = app;
