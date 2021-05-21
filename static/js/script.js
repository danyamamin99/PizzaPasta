document.addEventListener('DOMContentLoaded',() => {
  'use string';

  const tbody = document.querySelector('.basket__table tbody');
  const sectionBasket = document.querySelector('.basket');
  const form = document.querySelector('.form-basket');

  const basket = [];
  let total = 0;

  const getData = async (url) => {
    const req = await fetch(url);

    if (!req.ok) {
      throw new Error('Ошибка..')
    }

    return await req.json();
  };

  const postData = async (url, data) => {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return await req.json();
  }

  const renderTbody = () => {
    tbody.innerHTML = '';
    total = 0;

    basket.forEach(i => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <tr>
          <td class="text-left">${i.name}</td>
          <td>${i.price}</td>
          <td>${i.count}</td>
          <td>${i.price * i.count}</td>
        </tr>
      `;

      total += i.price * i.count;
      tbody.append(tr);
    });
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <tr>
          <td class="text-left">Итого:</td>
          <td>${total}</td>
      <tr>
    `;
    tbody.append(tr);

  };

  renderTbody();

  const basketPizza = () => {
    const btns = document.querySelectorAll('.pizza__item');
    sectionBasket.style.display = '';
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.pizza__basket')) {
          const id = e.target.dataset.id;
          const name = btn.querySelector('.pizza__title > h2').textContent;
          const size = btn.querySelector('.pizza__dimensions > .active').textContent;
          const price = btn.querySelector('.pizza__price > .pizza__value').textContent.split(' ')[0];
          let obj = {};
          let flag = true;

          basket.forEach(i => {
            if (id === i.id && size === i.size) {
              i.count++;
              flag = false;
            }
          });

          if (flag) {
            obj = { id, name, size, price, count: 1 };
            basket.push(obj);
          }

          renderTbody();
        }
      });
    });
  };

  const render = () => {
    const pizzaItems = document.querySelector('.pizza__items');

    const renderGood = (good) => {
      let price = '';

      if (good.price.length == 1) 
        price = '<div data-size=26 class="active" data-count="0">26 см</div>';
      else if (good.price.length == 2) 
        price = `<div data-size=30  data-count="0" class="active">30 см</div>
                <div data-size=40  data-count="1">40 см</div>`;
      else 
        price = `<div data-size=26  data-count="0" class="active">26 см</div>
                <div data-size=30  data-count="1">30 см</div>
                <div data-size=40  data-count="2">40 см</div>`;

      pizzaItems.insertAdjacentHTML('beforeend', `
        <li class="pizza__item" >
          <div class="pizza__img">
            <img src="${good.photo}" alt="${good.name}">
          </div>
          <div class="pizza__title">
            <h2>${good.name}</h2>
          </div>
          <div class="pizza__description">
            <p>${good.description}</p>
          </div>
          <div class="pizza__dimensions">${price}</div>
          <div class="pizza__price">
            <div class="pizza__gram">${good.gram[0]} г</div>
            <div class="pizza__value">${good.price[0]} <span class="rub">i</span></div>
          </div>
          <div class="pizza__basket">
            <button data-id=${good.id}>Добавить в корзину</button>
          </div>
        </li>
      `);
    };

    const createGoodsList = (goodsList) => {
      goodsList.forEach(good => renderGood(good));
      tabs('.pizza__dimensions', '.pizza__dimensions div', goodsList);
      basketPizza();
    };

    getData('dbase/db.json')
      .then(response => createGoodsList(response))
      .catch(error => console.log(error));
  };

  const tabs = (selectorSize, selectorActive, goods) => {

    const pizzaDimensions = document.querySelectorAll(selectorSize);
    let pizzaValue = document.querySelectorAll('.pizza__value');
    let pizzaGram = document.querySelectorAll('.pizza__gram');

    const deactive = (btns) => btns.forEach(btn => btn.classList.remove('active'));

    pizzaDimensions.forEach((item, i) => {
      item.addEventListener('click', (e) => {
          const target = e.target;
          if (target && target.getAttribute('data-size')) {
            const price = goods[i].price;
            const gram = goods[i].gram;
            const count = target.dataset.count;

            deactive(item.querySelectorAll(selectorActive));
            
            if (target.getAttribute('data-size') == 26) {
              pizzaValue[i].innerHTML = `${price[count]} <span class="rub">i</span>`;
              pizzaGram[i].innerHTML = `${gram[count]} г`;
            }
            if (target.getAttribute('data-size') == 30) {
              pizzaValue[i].innerHTML = `${price[count]} <span class="rub">i</span>`;
              pizzaGram[i].innerHTML = `${gram[count]} г`;
            }
            if (target.getAttribute('data-size') == 40) {
              pizzaValue[i].innerHTML = `${price[count]} <span class="rub">i</span>`;
              pizzaGram[i].innerHTML = `${gram[count]} г`;
            }

            target.classList.add('active');
          }
        })
      });
  }

  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const obj = {};

    for (let [name, value] of formData) {
      obj[name] = value;
    }
    obj.order = basket;

    postData('/order', obj)
      .then(response => {
        const div = document.createElement('div');
        div.classList.add('error')
        if (typeof response === 'object') div.textContent = response.errors.msg;
        else div.textContent = response;
        form.append(div);
      })
      .catch(error => console.log(error))
      .finally(() => {
        setTimeout(() => {
          basket.length = 0;
          tbody.innerHTML = '';
          form.reset();
          form.lastChild.remove()
        }, 3000);
      });
  });
}); 
