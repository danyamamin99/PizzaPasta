require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors')
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

const app = express();

const PORT = process.env.PORT || 3000;

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: "ВВЕДИ ПОЧТУ ДРУГА ЖЕЛАТЕЛЬНО MAIL.RU",
        pass: "ВВЕДИ ПАРОЛЬ ОТ ПОЧТЫ ДРУГА"
    }},
    {
        from: `Pizza&Pasta.Нягань <ВВЕДИ ПОЧТУ ДРУГА ЖЕЛАТЕЛЬНО MAIL.RU>`
    }
);

app.use(express.json())
app.use(cors())
app.use(express.static(path.resolve(__dirname, 'static')))

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.post('/order',
        body('name', "Введите имя").trim().isLength({min: 2}),
        body('phone', "Введите телефон в формате +7(ХХХ)-ХХХ-ХХ-ХХ").matches(/\+7\(\d{3}\) \d{3}-\d{2}-\d{2}/),
        body('order', "Заполните корзину!").isLength({min: 1}),
        (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()[0] });
    }
    const user = req.body;
    
    let list = '';

    user.order.forEach(i => {
      list += `
        Название: ${i.name}
        Размер: ${i.size} 
        Цена: ${i.price}
        Количество: ${i.count}
      `;
    })

    const userOrder = `
    Покупатель - ${user.name}
    Телефон - ${user.phone}
    Заказ: ${list}
    `;

    const message = {
      to: "ВВЕДИ ПОЧТУ ДРУГА ЖЕЛАТЕЛЬНО MAIL.RU",
      subject: "Pizza&Pasta.Нягань",
      text: userOrder
    };

    transporter.sendMail(message, (err, info) => {
      if (err) res.status(550).json('Ошибка на сервере. Попробуйте заново!');
      else res.status(200).json('Заказ был отправлен!');
    });
  } catch (e) {
    res.status(500).json('Что то пошло не так...' + e.message);
  }
});

app.listen(PORT, () => console.log(`App started - ${PORT}`))