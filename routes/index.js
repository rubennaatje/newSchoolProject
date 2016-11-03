var express = require('express');
var router = express.Router();
var testcontroller = require("../controllers/test");
var betalingController = require("../controllers/betalingsController");
var sprekerController = require("../controllers/SprekerController");
var organisatorController = require("../controllers/OrganisatorController");
var qr = require('qr-image');
/* GET home page. */
router.get('/',testcontroller.homeController);
router.get('/test',betalingController.xd);
router.get('/tickets',betalingController.first);
router.get('/tickets/get',betalingController.vierde);
router.post('/tickets',betalingController.tweede);
router.post('/tickets/bevestig',betalingController.derde);
router.get('/spreker/agenda/:dag',sprekerController.agenda);
router.get('/programma',sprekerController.programma);
router.get('/contact',organisatorController.contact);
router.get('/about',organisatorController.about);
router.post('/contact',organisatorController.stuurContact);
router.get('/organisator/aanvragen',organisatorController.aanvragen);
router.post('/organisator/reservatie',organisatorController.mailReservatie);
router.get('/organisator/bekijksprekers',organisatorController.bekijkSprekers);
router.get('/organisator/',organisatorController.home);
router.get('/login',organisatorController.loginForm);
router.get('/logout',organisatorController.logout);

router.get('/organisatie/update/:id/:spreker',organisatorController.updatenAanvraag);
router.get('/slot/:id',sprekerController.showSpreker);
router.post('/slot/:id',sprekerController.reserveerSpreker);
router.post('/sprekerContact',sprekerController.sprekerContact);

router.post('/login',organisatorController.login);

router.post('/spreker/slotaanvraag',sprekerController.vraagAanSlot);

module.exports = router;
