import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY =
  'AC550BB0F08AD7067CB68FEF729CC2';

const SECRET_KEY =
  'C73CD54D55EA4259907DFF67159461';


app.post('/send-sms', async (req, res) => {


  console.log(req.body);



  const { phone, content } = req.body;

  let formattedPhone = phone.trim();

  if (formattedPhone.startsWith('0')) {

    formattedPhone =
      '84' + formattedPhone.slice(1);
  }

  try {

    const response = await axios.get(
      'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get',
      {
        params: {

          Phone: formattedPhone,

          Content: content,

          ApiKey: API_KEY,

          SecretKey: SECRET_KEY,

          SmsType: 2,

          Sandbox: 0,

          Brandname: 'Baotrixemay'
        }
      }
    );

    console.log(
      'ESMS RESPONSE:',
      response.data
    );

    res.json(response.data);

  } catch (err) {

    console.log(
      err.response?.data || err.message
    );

    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(3000, () => {

  console.log(
    'Server running on port 3000'
  );
});