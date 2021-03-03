'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-02-20T17:01:17.194Z',
    '2021-02-21T23:36:17.929Z',
    '2021-02-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcdayspassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcdayspassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // const displayDate = `${day}/${month}/${year}`;
    // return displayDate;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // Looping of two arrays at the same time
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    // When 0 seconds,stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrease 1s
    time--;
  };
  //Setting the time to 5 mins
  let time = 120;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// Fake always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Experimenting with ISO
// const now = new Date();
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long', //2-point/numeric
//   year: 'numeric', //2-point/long
//   weekday: 'long', //short/numeric
// };

// const locale = navigator.language;
// console.log(locale);
// labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = now.getHours();
// const min = now.getMinutes();

//day/month/year

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create Current Date
    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //2-point/numeric
      year: 'numeric', //2-point/long
      // weekday: 'long', //short/numeric
    };

    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // console.log(now);
    // labelDate.textContent = `${day}/${month}/${year} , ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date());
    // Update UI
    updateUI(currentAccount);

    // Reset The timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add Loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// ///////////////////////////
// 1. Converting and Checking numbers
// console.log(23 === 23.0);

// // Base 10 - 0 to 9
// // Binary base 2 - 0 1
// // Thats why Js is not recommended for calculations
// console.log(0.1 + 0.2);
// console.log(0.1 === 0.3); //false
// console.log(3 / 10);

// // Conversion str->int
// console.log(Number('23'));
// // Whenever Js sees '+' operator it does type coercion and converts all to integer
// console.log(+'23');

// // Parsing
// //Js detects the number from the only if the string begins with a number
// console.log(Number.parseInt('30px')); //30
// console.log(Number.parseInt('e23')); //NaN

// console.log(Number.parseInt(' 2.5rem '));
// console.log(Number.parseFloat(' 2.5rem '));

// // isNan

// console.log(Number.isNaN(20));
// console.log(Number.isNaN('20'));
// console.log(Number.isNaN(+'20X'));
// console.log(Number.isNaN(23 / 0));

// // isFinite:Check if value is NaN

// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));

// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));

// //////////////////////////////////
// Math and Rounding
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));

// console.log(Math.max(5, 18, 23, 11, 2)); //23
// console.log(Math.max(5, 18, '23', 11, 2)); //23
// console.log(Math.max(5, 18, '23px', 11, 2)); //Nan
// console.log(Math.min(5, 18, 23, 11, 2)); //2

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.trunc(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 20)); //stays within the range of max and min
// // 0...1->0...(max-min)->min...(max-min+min)->min...(max-min+min)

// Rounding Integers

// console.log(Math.trunc(23.3));

// console.log(Math.round(23.3));
// console.log(Math.round(23.9));

// console.log(Math.ceil(23.3));
// console.log(Math.ceil('23.9'));

// console.log(Math.floor(23.3)); //23
// console.log(Math.floor(23.9)); //23

// // Floor and trunc works similar for positive numbers

// // But for -ve nums
// console.log(Math.trunc(-23.3)); //-23
// console.log(Math.floor(-23.3)); //-24

// // Floating Point Numbers

// // toFixed returns a string
// // Rounding Decimals
// // 2.7 here is string and it is primitive and here js does boxing converts string to integer object so that methods can be applied
// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log((2.345).toFixed(2));
// console.log(+(2.345).toFixed(2));

// ///////////////////////////////////////////////
// Remainder operator
// console.log(5 % 2);
// console.log(5 / 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(5));
// console.log(isEven(56));

// labelBalance.addEventListener('click', function () {
//   //.movements__row is a Nodelist so we need to covert it to array to apply the methods
//   [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = 'orangered';
//     if (i % 3 === 0) row.style.backgroundColor = 'blue';
//   });
// });

// BigInt

// Numbers are 64 bits only 53 bits to store numbers and rest of 63 are used for decimal points

// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(2 ** 53 + 1);
// console.log(2 ** 53 + 0);
// console.log(2 ** 53 + 3);

// // Js cant represent numbers accurately that are bigger than 2 ** 53 - 1
// // So we use BigInt for this
// // BigInt
// console.log(44444444444444444444444444444888888888n); //Primarily use this syntax for BigInt
// console.log(BigInt(44444444444444444444444444444888888888));

// // Operations
// console.log(10000n + 10000n);
// console.log(888888888888888888888844455658889998888888n * 10000000n);

// const huge = 20202222222222222222222222222887n;
// const nun = 23;
// // console.log(Math.sqrt(16n));//error
// // BigInt can only be used with other BigInt
// console.log(huge * BigInt(nun));

// // BigInt works with other while comapring and working with string
// console.log(20n > 15); //true
// console.log(20n === 20); //false
// console.log(typeof 20n); //bigint
// console.log(20n == '20'); //true
// console.log(huge + ' is Really big!!!'); //20202222222222222222222222222887 is REALLY big !!!
// // Divisions
// console.log(10n / 3n); //3n

//////////////////////////////////////////////////////////
// Creating Dates

// Current date
// const now = new Date();
// console.log(now);

// console.log(new Date('Aug 02 2020 20:05:22'));
// console.log(new Date('December 24,2015'));
// console.log(new Date(account1.movementsDates[0]));

// // Month in Js is zero-based thats it starts with 0
// // In this case 10 refers to November
// console.log(new Date(2021, 10, 19, 15, 23, 5));

// // Js autocorrects Dates
// console.log(new Date(2021, 10, 33, 15, 23, 5)); //Dec 03

// // Unix timestamp
// console.log(new Date(0));
// // Days to milliseconds
// // no. of days * no. of hours in a day * 60 mintues in 1hr * 60s in 1 min * 1000
// // This is called a timestamp of day no. 3
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with dates
// const future = new Date(2017, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay()); //it returns the day of the week not of the month
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());

// console.log(new Date(1511085180000));

// // Current timestamp
// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);

// /////////////////////////////////////
//Operating with Days

// const future = new Date(2017, 10, 19, 15, 23);
// console.log(+future);

// const calcdayspassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// const days1 = calcdayspassed(new Date(2017, 3, 24), new Date(2017, 3, 14));
// console.log(days1);

// const num = 3884764.23;

// const options = {
//   // style: 'unit', //unit/percent/currency
//   // unit: 'celsius',

//   // For style=currency we have to define the currency
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR',
//   // useGrouping: false,
// };
// console.log('US', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('Syria', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

// /////////////////////////////////////////////////////
// setTimeout and setInterval

// setTimeout
// const ingredients = ['chicken', 'tandoori sauce'];
// const burgTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your Burger🚛 with ${ing1} and ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting....');

// if (ingredients.includes('chicken')) clearTimeout(burgTimer);

// setInterval

// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 3000);
