import express, { response } from "express";
import pg from "pg";
import axios from 'axios';
import bodyParser from "body-parser";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

dotenv.config();

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT,
});
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//==================================================================//

app.get('/api/googleMapsKey', async (req, res) => {

    res.json(googleMapskey);
});

app.get('/api/locations', async (req, res) => {
    
    let query = await db.query(`SELECT ra, firstname, lastname, city, address, role FROM userTable`);

    const userDbData = query.rows;

    for(let i = 0; i < userDbData.length; i++) {
        userDbData[i].coordinates = await getCoordinates(userDbData[i].address + ", " + userDbData[i].city);
    }

    res.json(userDbData);
});

//==================================================================// 

// User Data

var isLoged = false;
var userRa = "";
var standartCity = "Sorocaba";

var userObj = {};
var todayClassObj = {};

// Weather API Data

const apiKey = process.env.WEATHER_API_KEY;

var temperature = 0;
var iconCode = 0;
var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${standartCity}&appid=${apiKey}&units=metric&lang=pt_br`;
var iconUrl = "";
var description = "";

var weatherObj = {};

// Google Maps API Key

var googleMapskey = process.env.GOOGLE_MAPS_API_KEY;

// Date Data

var day = 0;
var dayOfWeek = "";
var month = "";

var dateObj = {};

//==================================================================//

function getDateData() {

    dateObj = {};
    
    const today = new Date();

    day = today.getDate();

    switch(today.getMonth()) {
        case 0: month = "Janeiro"; break;
        case 1: month = "Fevereiro"; break;
        case 2: month = "Março"; break;
        case 3: month = "Abril"; break;
        case 4: month = "Maio"; break;
        case 5: month = "Junho"; break;
        case 6: month = "Julho"; break;
        case 7: month = "Agosto"; break;
        case 8: month = "Setembro"; break;
        case 9: month = "Outubro"; break;
        case 10: month = "Novembro"; break;
        case 11: month = "Dezembro"; break;
    }

    switch(today.getDay()) {
        case 0: dayOfWeek = "Domingo"; break;
        case 1: dayOfWeek = "Segunda-feira"; break;
        case 2: dayOfWeek = "Terça-feira"; break;
        case 3: dayOfWeek = "Quarta-feira"; break;
        case 4: dayOfWeek = "Quinta-feira"; break;
        case 5: dayOfWeek = "Sexta-feira"; break;
        case 6: dayOfWeek = "Sábado"; break;
    }

    dateObj.day = day;
    dateObj.dayOfWeek = dayOfWeek;
    dateObj.month = month;
}

async function getWeatherData() {
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        })
        .catch(error => {
            console.log("Erro ao acessar os dados do clima", error);
            throw error;
        })
        .then(data => {

            processWeatherData(data);
        });
}

function processWeatherData(data) {

    weatherObj = {};

    temperature = Math.round(data.main.temp);
    iconCode = data.weather[0].icon;
    iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    description = (data.weather[0].description).charAt(0).toUpperCase() + (data.weather[0].description).slice(1);

    weatherObj.temperature = temperature;
    weatherObj.iconUrl = iconUrl;
    weatherObj.description = description;
}

async function getUserData() {

    userObj = {};

    if(isLoged) {

        let query = await db.query(`SELECT * FROM userTable WHERE ra = '${userRa}'`);

        const userDbData = query.rows;

        // console.log(userDbData);

        userObj.isLoged = isLoged;
        userObj.ra = userRa;

        let firstName = userDbData[0].firstname;
        let lastName = userDbData[0].lastname;
        userObj.name = firstName + " " + lastName;

        userObj.course = userDbData[0].course;
        userObj.semester = userDbData[0].semester;
        userObj.period = (userDbData[0].period === 'M' ? "Manhã" : "Noite");
        userObj.address = userDbData[0].address;
        userObj.city = userDbData[0].city;
        userObj.role = userDbData[0].role;
        userObj.classes = userDbData[0].classesbool;
        userObj.rides = userDbData[0].ridesbool;

        if(userObj.classes) {

            let hasClassToday = false;
            
            query = await db.query(`SELECT * FROM classes WHERE ra = '${userObj.ra}'`);
            
            const classesDbData = query.rows;

            // console.log(classesDbData);

            let weekDaysRegistered = [];

            for(let i = 0; i < classesDbData.length; i++) {

                let currentDay = (classesDbData[i].weekday + 1);

                weekDaysRegistered.push(currentDay);
            }

            const today = new Date();

            const todayWeekDay = (today.getDay());
            // const todayWeekDay = 4;

            // console.log(todayWeekDay);
            // console.log(weekDaysRegistered);

            if(weekDaysRegistered.includes(todayWeekDay)) {

                hasClassToday = true;
            }

            userObj.hasClassToday = hasClassToday;

            if(hasClassToday) {

                todayClassObj = {};

                for(let i = 0; i < classesDbData.length; i++) {

                    if(classesDbData[i].weekday === todayWeekDay - 1) {

                        todayClassObj.period = classesDbData[i].period;
                        todayClassObj.class1 = classesDbData[i].class1;
                        todayClassObj.class2 = classesDbData[i].class2;
                        todayClassObj.class3 = classesDbData[i].class3;
                        todayClassObj.class4 = classesDbData[i].class4;
                        todayClassObj.freeClassMessage = "Aula Livre";

                        break;
                    }
                }

                userObj.todayClassObj = todayClassObj;
            }  
        }

        if(userObj.rides) {

            if(userObj.role === 'M') {

                query = await db.query(`SELECT * FROM rides WHERE ra = '${userRa}'`);

                let rideDataDb = query.rows[0];

                // console.log(rideDataDb);

                let todayRideObj = {};

                // console.log(rideDataDb);

                todayRideObj.riderName = userObj.name;
                todayRideObj.startingPoint = rideDataDb.startlocation;
                todayRideObj.startingHour = rideDataDb.starthour;

                // console.log(todayRideObj);

                let rideID = rideDataDb.ridesid;

                query = await db.query(`SELECT * FROM ridePassengers WHERE rideID = ${rideID}`);

                let thisRidePassengers = query.rows;

                if(thisRidePassengers.length !== 0) {

                    let todayRidePassengers = [];

                    let passengersLen = thisRidePassengers.length;

                    for(let i = 0; i < passengersLen; i++) {

                        let eachPassenger = thisRidePassengers[i];

                        query = await db.query(`SELECT firstname, lastname FROM userTable WHERE ra = '${eachPassenger.ra}'`);

                        let eachPassengerName = query.rows[0].firstname + " " + query.rows[0].lastname;
                        let eachPassengerRa = eachPassenger.ra;

                        eachPassenger = {};

                        eachPassenger.eachPassengerName = eachPassengerName;
                        eachPassenger.eachPassengerRa = eachPassengerRa;

                        todayRidePassengers.push(eachPassenger);
                    }

                    // console.log(todayRidePassengers);

                    userObj.todayRidePassengers = todayRidePassengers;
                }

                userObj.todayRideObj = todayRideObj;

            } else {

                let todayRideObj = {};

                query = await db.query(`SELECT rideID FROM ridePassengers WHERE ra = '${userRa}'`);

                // console.log(query.rows);

                let passengerRideData = query.rows[0];
                let rideID = passengerRideData.rideid;

                // PEGAR O MOTORISTA

                query = await db.query(`SELECT * FROM rides WHERE ridesID = ${rideID}`);

                let rideGeneralData = query.rows[0];

                let riderRA = rideGeneralData.ra;
                let rideStartingPoint = rideGeneralData.startlocation;
                let rideStartingHour = rideGeneralData.starthour;
                let avaliableSeats = rideGeneralData.avaliableSeats;

                query = await db.query(`SELECT firstname, lastname FROM userTable WHERE ra = '${riderRA}'`);

                let riderName = query.rows[0].firstname + " " + query.rows[0].lastname;

                // console.log(riderName);

                todayRideObj.riderName = riderName;
                todayRideObj.rideStartingPoint = rideStartingPoint;
                todayRideObj.rideStartingHour = rideStartingHour;

                // PEGAR OS PASSAGEIROS

                query = await db.query(`SELECT * FROM ridePassengers WHERE rideID = ${rideID} AND ra != '${userRa}'`);

                let thisRidePassengers = query.rows;

                if(thisRidePassengers.length !== 0) {

                    let todayRidePassengers = [];

                    let passengersLen = thisRidePassengers.length;

                    for(let i = 0; i < passengersLen; i++) {

                        let eachPassenger = thisRidePassengers[i];

                        query = await db.query(`SELECT firstname, lastname FROM userTable WHERE ra = '${eachPassenger.ra}'`);

                        let eachPassengerName = query.rows[0].firstname + " " + query.rows[0].lastname;
                        let eachPassengerRa = eachPassenger.ra;

                        eachPassenger = {};

                        eachPassenger.eachPassengerName = eachPassengerName;
                        eachPassenger.eachPassengerRa = eachPassengerRa;

                        todayRidePassengers.push(eachPassenger);
                    }

                    // console.log(todayRidePassengers);

                    userObj.todayRidePassengers = todayRidePassengers;
                }

                userObj.todayRideObj = todayRideObj;
            }
        }
    } else {
        userObj.isLoged = isLoged;
        userObj.city = standartCity;
    }
}

async function getPassengers(names, courses, cities, ras, passengersObj) {

    const query = await db.query("SELECT * FROM userTable WHERE role = 'P'");

    let dbInfo = query.rows;

    // console.log(dbInfo);

    for(let i = 0; i < dbInfo.length; i++) {

        let firstName = dbInfo[i].firstname;
        let lastName = dbInfo[i].lastname;
        let fullName = firstName + " " + lastName;
        names.push(fullName);

        courses.push(dbInfo[i].course);
        cities.push(dbInfo[i].city);
        ras.push(dbInfo[i].ra);
    }

    passengersObj.names = names;
    passengersObj.courses = courses;
    passengersObj.cities = cities;
    passengersObj.ras = ras;
}

async function getDrivers(names, courses, cities, ras, driversObj) {

    const query = await db.query("SELECT * FROM userTable WHERE role = 'M'");

    let dbInfo = query.rows;

    // console.log(dbInfo);

    for(let i = 0; i < dbInfo.length; i++) {

        let firstName = dbInfo[i].firstname;
        let lastName = dbInfo[i].lastname;
        let fullName = firstName + " " + lastName;
        names.push(fullName);

        courses.push(dbInfo[i].course);
        cities.push(dbInfo[i].city);
        ras.push(dbInfo[i].ra);
    }

    driversObj.names = names;
    driversObj.courses = courses;
    driversObj.cities = cities;
    driversObj.ras = ras;

    // console.log(driversObj);
}

async function validateLogin(loginResponse) {

    const queryRA = await db.query("SELECT ra FROM userTable");

    const dbInfoRa = queryRA.rows;

    let raList = [];

    for(let i = 0; i < dbInfoRa.length; i++) {
        raList.push(dbInfoRa[i].ra);
    }

    for(let i = 0; i < raList.length; i++) {
        if(loginResponse.ra === raList[i]) {

            const insertedRa = loginResponse.ra;
            const insertedPassword = loginResponse.password;

            // console.log(typeof(userRa));

            const queryPassword = await db.query(`SELECT password FROM userTable WHERE ra = '${insertedRa}'`);

            // console.log(queryPassword);

            const dbInfoPassword = queryPassword.rows[0].password;

            // console.log(dbInfoPassword);

            // 1 - RA INVALIDO
            // 2 - SENHA INVALIDA
            // 3 - OK

            if(dbInfoPassword === insertedPassword) {
                return 3;
            } else {
                return 2;
            }

            break;
        }
    }

    return 1;
}

async function validateSignUp(signUpData) {

    // var { ra, password, name, city, course, role } = signUpData;

    // console.log(signUpData);

    let newUserRa = signUpData.ra;
    let newUserPassword = signUpData.password;
    let newUserFirstName = signUpData.firstName;
    let newUserLastName = signUpData.lastName;
    let newUserCourse = signUpData.course;
    let newUserRole = signUpData.role == "Motorista" ? 'M' : 'P';
    let newUserCity = signUpData.city;
    let newUserAddress = signUpData.address;
    let newUserWhatsappNumber = signUpData.whatsapp;
    let newUserInstagramName = signUpData.instagram;
    let newUserLinkedinName = signUpData.linkedin;

    let ig = true;

    if(newUserInstagramName === "") {
        ig = false;
    } 

    let lk = true;

    if(newUserInstagramName === "") {
        lk = false;
    }

    let newUserSemester = 0;

    switch(signUpData.semester) {
        case "s1": newUserSemester = 1; break;
        case "s2": newUserSemester = 2; break;
        case "s3": newUserSemester = 3; break;
        case "s4": newUserSemester = 4; break;
        case "s5": newUserSemester = 5; break;
        case "s6": newUserSemester = 6; break;
        case "s7": newUserSemester = 7; break;
        case "s8": newUserSemester = 8; break;
        case "s9": newUserSemester = 9; break;
        case "s10": newUserSemester = 10; break;
    }

    let newUserPeriod;

    switch(signUpData.period) {
        case "morning": newUserPeriod = 'M'; break;
        case "noon": newUserPeriod = 'T'; break;
        case "evening": newUserPeriod = 'N'; break;
    }

    switch(newUserCourse) {
        case "agronomia": newUserCourse = "Engenharia Agronômica"; break;
        case "alimentos": newUserCourse = "Engenharia de Alimentos"; break;
        case "civil": newUserCourse = "Engenharia Civil"; break;
        case "computacao": newUserCourse = "Engenharia de Computação"; break;
        case "eletrica": newUserCourse = "Engenharia Elétrica"; break;
        case "mecanica": newUserCourse = "Engeharia Mecânica"; break;
        case "mecatronica": newUserCourse = "Engenharia Mecatrônica"; break;
        case "producao": newUserCourse = "Engenharia de Produção"; break;
        case "quimica": newUserCourse = "Engenharia Química"; break;
        case "ads": newUserCourse = "Análise e Desenvolvimento de Sistemas"; break;
        case "bds": newUserCourse = "Banco de Dados"; break;
        case "gti": newUserCourse = "Tecnologia em Gestão de T.I."; break;
        case "jds": newUserCourse = "Tecnologia em Jogos Digitais"; break;
    }

    try {

        // INSERE userTable

        let query = 'INSERT INTO userTable (firstname, lastname, ra, password, course, semester, period, city, address, role, phonenumber, igbool, lkbool) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';

        // console.log("teste");

        await db.query(query, [newUserFirstName, newUserLastName, newUserRa, newUserPassword, newUserCourse, newUserSemester, newUserPeriod, newUserCity, newUserAddress, newUserRole, newUserWhatsappNumber, ig, lk]);

        // INSERE NA TABLE MIDIA

        query = 'INSERT INTO socialMedia (ra, whatsapp, instagram, linkedin) VALUES ($1, $2, $3, $4)';

        await db.query(query, [newUserRa, newUserWhatsappNumber, newUserInstagramName, newUserLinkedinName]);

        // const queryPassword = await db.query(`SELECT password FROM userTable WHERE ra = '${insertedRa}'`);

        let newUserSocialMediaID = await db.query(`SELECT socialMediaID FROM socialMedia where ra = '${newUserRa}'`);

        let socialMediaID = newUserSocialMediaID.rows[0].socialmediaid;

        // console.log(socialMediaID);

        query = `UPDATE userTable SET socialMediaID = $1 WHERE ra = '${newUserRa}'`;

        await db.query(query, [socialMediaID]);

        // console.log("Ok");

    } catch(err) {

        console.log(err);
    }
}

async function getSelectedUserData(ra, selectedUserObj) {
    
    let query = await db.query(`SELECT * FROM userTable WHERE ra = '${ra}'`);

    // console.log(query.rows);

    let selectedUserRa = query.rows[0].ra;

    let selectedUserFirstName = query.rows[0].firstname;
    let selectedUserLastName = query.rows[0].lastname;
    let selectedUserName = selectedUserFirstName + " " + selectedUserLastName;

    let selectedUserCourse = query.rows[0].course;

    if(selectedUserCourse === "Análise e Desenvolvimento de Sistemas") {
        selectedUserCourse = "ADS";
    }

    let selectedUserSemester = query.rows[0].semester;
    let selectedUserPeriod = query.rows[0].period;
    let selectedUserCity = query.rows[0].city;
    let selectedUserRole = query.rows[0].role;
    let selectedUserClasses = query.rows[0].classesbool;
    let selectedUserRides = query.rows[0].ridesbool;

    let selectedUserNumberPhone = query.rows[0].phonenumber;
    let selectedUserIGBool = query.rows[0].igbool;
    let selectedUserLKBool = query.rows[0].lkbool;

    selectedUserObj.ra = selectedUserRa;
    selectedUserObj.name = selectedUserName;
    selectedUserObj.course = selectedUserCourse;
    selectedUserObj.semester = selectedUserSemester;
    selectedUserObj.period = (selectedUserPeriod === 'M' ? "Manhã" : "Noite");
    selectedUserObj.city = selectedUserCity;
    selectedUserObj.role = (selectedUserRole === 'P' ? "Passageiro" : "Motorista");
    selectedUserObj.classes = selectedUserClasses;
    selectedUserObj.rides = selectedUserRides;
    selectedUserObj.numberPhone = selectedUserNumberPhone;

    if(selectedUserObj.rides) {

        if(selectedUserRole === 'P') {

            query = await db.query(`SELECT B.startlocation, CURRENT_DATE - B.ridestart::DATE AS days FROM ridePassengers A LEFT JOIN rides B ON A.rideid = B.ridesid WHERE A.ra = '${selectedUserRa}'`);

        } else {

            query = await db.query(`SELECT startlocation, CURRENT_DATE - ridestart::DATE AS days FROM rides WHERE ra = '${selectedUserRa}'`);

        }

        let startingAddress = query.rows[0].startlocation;
        let rideDays = query.rows[0].days;

        // console.log(startingAddress);
        // console.log(rideDays);

        let coordinates = await getCoordinates(startingAddress);

        // console.log(coordinates);

        let startLat = coordinates.lat;
        let startLon = coordinates.lng;

        coordinates = await getCoordinates('Rua Facens, Sorocaba');

        // console.log(coordinates);

        let endLat = coordinates.lat;
        let endLon = coordinates.lng;

        let distance = parseFloat(await calculateDistance(startLat, startLon, endLat, endLon));

        // console.log(distance);
        // console.log(typeof rideDays);

        let totalKM = (distance * rideDays * 2).toFixed(2);
        let totalCO2 = ((totalKM * 2300) / 1000).toFixed(2);

        selectedUserObj.totalKM = totalKM;
        selectedUserObj.totalCO2 = totalCO2;

    } else {

        console.log("sem viagem");
    }

    if(selectedUserIGBool) {

        query = await db.query(`SELECT instagram FROM socialMedia WHERE ra = '${selectedUserRa}'`);

        let selectedUserInstagram = query.rows[0].instagram;

        selectedUserObj.instagramName = selectedUserInstagram;
    }

    if(selectedUserLKBool) {

        query = await db.query(`SELECT linkedin FROM socialMedia WHERE ra = '${selectedUserRa}'`);

        let selectedUserLinkedin = query.rows[0].linkedin;

        selectedUserObj.linkedinName = selectedUserLinkedin;
    }

    // console.log(selectedUserObj);
}

async function validateClassesReg(classRegResponse) {

    var { weekDay, class1, class2, class3, class4 } = classRegResponse;

    let charPeriod = (userObj.period === 'Noite' ? 'N' : 'M');
    let weekDayNum = -1;

    switch(weekDay) {
        case "seg": weekDayNum = 0;  break;
        case "ter": weekDayNum = 1;  break;
        case "qua": weekDayNum = 2;  break;
        case "qui": weekDayNum = 3;  break;
        case "sex": weekDayNum = 4;  break;
    }

    try {
        let query = 'INSERT INTO classes (ra, weekday, period, class1, class2, class3, class4) VALUES ($1, $2, $3, $4, $5, $6, $7)';

        await db.query(query, [userObj.ra, weekDayNum, charPeriod, class1, class2, class3, class4]);

        query = `UPDATE userTable SET classesBool = true WHERE ra = '${userObj.ra}'`;

        await db.query(query);

        // query = `UPDATE userTable SET socialMediaID = $1 WHERE ra = '${newUserRa}'`;

        // await db.query(query, [socialMediaID]);

    } catch (err) {
        console.log(err);
    }
}

async function validateRideRegistration(rideRegistrationObj) {

    var { start, startTime, seats } = rideRegistrationObj;

    switch(seats) {
        case "seat1": seats = 1; break;
        case "seat2": seats = 2; break;
        case "seat3": seats = 3; break;
        case "seat4": seats = 4; break;
        case "seat5": seats = 5; break;
    }

    try {

        let query = 'INSERT INTO rides (ra, startLocation, startHour, avaliableSeats) VALUES ($1, $2, $3, $4)';

        await db.query(query, [userObj.ra, start, startTime, seats]);

        query = `UPDATE userTable SET ridesBool = true WHERE ra = '${userObj.ra}'`;

        await db.query(query);

    } catch(err) {
        console.log(err);
    }
}

async function getRiders(riders) {

    let query = await db.query("SELECT * FROM rides");

    let ridersDb = query.rows;
    let ridesQtt = ridersDb.length;

    for(let i = 0; i < ridesQtt; i++) {

        query = await db.query(`SELECT firstName, lastName FROM userTable WHERE ra = '${ridersDb[i].ra}'`);

        let firstName = query.rows[0].firstname;
        let lastName = query.rows[0].lastname;
        let fullName = firstName + " " + lastName;

        let eachRide = {};

        eachRide.name = fullName;
        eachRide.ra = ridersDb[i].ra;
        eachRide.startingLocation = ridersDb[i].startlocation;
        eachRide.startingHour = ridersDb[i].starthour;
        eachRide.seats = ridersDb[i].avaliableseats;

        riders.push(eachRide);
    }

    // console.log(riders);
}

async function enterRide(selectedRiderRa) {

    let query = await db.query(`SELECT ridesID, avaliableSeats FROM rides WHERE ra = '${selectedRiderRa}'`);

    let currentAvaliableSeats = query.rows[0].avaliableseats;
    let currentRidesID = query.rows[0].ridesid;

    try {

        query = `UPDATE rides SET avaliableSeats = ${currentAvaliableSeats - 1} WHERE ra = '${selectedRiderRa}'`;

        db.query(query);

        query = `UPDATE userTable SET ridesBool = true WHERE ra = '${userObj.ra}'`;

        db.query(query);

        query = 'INSERT INTO ridePassengers (rideID, ra) VALUES ($1, $2)';

        await db.query(query, [currentRidesID, (userObj.ra)]);

    } catch(err) {

        console.log(err);
    }
}

async function getCoordinates(address) {

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapskey}`;

    try {
        const response = await axios.get(geocodeUrl);
        const data = response.data;

        if (data.status === 'OK') {
            const lat = data.results[0].geometry.location.lat;
            const lng = data.results[0].geometry.location.lng;
            // console.log(`Latitude: ${lat}, Longitude: ${lng}`);
            return { lat, lng };
        } else {
            console.log('Endereço não encontrado.');
            return null;
        }
    } catch (error) {
        console.error('Erro ao consultar a API:', error);
        return null;
    }
}

async function calculateDistance(startLat, startLon, endLat, endLon) {

    let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startLat},${startLon}&destinations=${endLat},${endLon}&key=${googleMapskey}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }

        const data = await response.json();

        // console.log(data.rows[0].elements[0].distance.text);

        return data.rows[0].elements[0].distance.text;

    } catch {
        console.log("Erro ao calcular a distancia");

        return '0';
    }
}

//==================================================================//

app.get("/", async (req, res) => {

    // console.log(isLoged);

    await getUserData();

    getWeatherData();

    getDateData();

    // console.log(userObj);

    res.render("home.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj });
});

app.get("/passengers", async (req, res) => {

    let names = [];
    let courses = [];
    let cities = [];
    let ras = [];
    let passengersObj = {};

    await getUserData();

    getWeatherData();

    getDateData();

    await getPassengers(names, courses, cities, ras, passengersObj);

    let passengersQtt = passengersObj.names.length;

    passengersObj.passengersQtt = passengersQtt;

    res.render("passengers.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj, passengersObj: passengersObj });
});

app.get("/drivers", async (req, res) => {

    let names = [];
    let courses = [];
    let cities = [];
    let ras = [];
    let driversObj = {};

    await getUserData();

    getWeatherData();

    getDateData();
            
    await getDrivers(names, courses, cities, ras, driversObj);

    let driversQtt = driversObj.names.length;

    driversObj.driversQtt = driversQtt;

    res.render("drivers.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj, driversObj: driversObj });
});

app.get("/login", async (req, res) => {

    await getUserData();

    res.render("login.ejs", { userObj: userObj });
});

app.post("/", async (req, res) => {

    let loginResponse = req.body;

    let errorCode = 0;

    switch(await validateLogin(loginResponse)) {
        case 1: {
            errorCode = 1; 
            break;
        }
        case 2: {
            errorCode = 2; 
            break;
        }
        case 3: {
            errorCode = 3; 
            break;
        }
    }

    if(errorCode !== 3) {

        await getUserData();

        res.render("login.ejs", { userObj: userObj, validation: errorCode });
        return;
    }

    isLoged = true;

    userRa = loginResponse.ra;

    await getUserData();

    getWeatherData();

    getDateData();

    // console.log(userObj);
    
    res.render("home.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj });
});

app.get("/signup", async (req, res) => {

    await getUserData();

    res.render("signupV2.ejs", { userObj: userObj });
});

app.post("/login", async (req, res) => {

    await validateSignUp(req.body);

    // console.log(req.body);

    await getUserData();

    res.render("login.ejs", { userObj: userObj });
});

app.get("/home", (req, res) => {

    // isLoged = false;

    res.redirect("/");
});

app.get("/logout", (req, res) => {

    isLoged = false;

    res.redirect("/");
});

app.get("/users/:ra", async (req, res) => {

    const selectedUserObj = {};

    const selectedUserRa = req.params.ra;

    await getSelectedUserData(selectedUserRa, selectedUserObj);

    // console.log(selectedUserObj);

    await getUserData();

    getWeatherData();

    getDateData();
    
    res.render("profile.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj, selectedUserObj: selectedUserObj });
});

app.get("/classesReg", async (req, res) => {

    await getUserData();

    // console.log(userObj);

    res.render("classesReg.ejs", { userObj: userObj });
});

app.post("/users/:ra", async (req, res) => {

    // pegar as classes e colocar no banco de dados e mudar a variavel classes para true

    let classRegResponse = req.body;

    await getUserData();

    await validateClassesReg(classRegResponse, userObj);

    res.redirect("/");
});

app.get("/ridesReg", async (req, res) => {

    await getUserData();

    // console.log(userObj);

    res.render("ridesReg.ejs", { userObj: userObj });
});

app.post("/validateRideRegistration", async (req, res) => {

    let rideRegistrationResponse = req.body;

    // console.log(rideRegistrationResponse);

    await getUserData();

    await validateRideRegistration(rideRegistrationResponse);

    res.redirect("/");
});

app.get("/rides", async (req, res) => {

    let riders = [];

    await getUserData();

    getWeatherData();

    getDateData();

    await getRiders(riders);

    res.render("riders.ejs", { userObj: userObj, dateObj: dateObj, weatherObj: weatherObj, ridersObj: riders });
});

app.get("/rideJoiner/:ra", async (req, res) => {

    const selectedRiderRa = req.params.ra;

    // console.log(selectedRiderRa);

    await enterRide(selectedRiderRa);

    await getUserData();

    res.redirect("/rides");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});