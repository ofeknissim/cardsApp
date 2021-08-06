const indexR = require("./index");
const usersR = require("./users");
const cardsR = require("./cards");

exports.originAllow = (app) => {
  // You can receive requests from another domain
  app.all('*', function (req, res, next) {
    if (!req.get('Origin')) return next();
    // in the Reality We would swap the asterisk for the domain names we wanted
    //That can send us cargo in any kind of request
    res.set('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,x-auth-token');
    next();
  });
}

exports.routerInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/cards",cardsR);


  app.use((req,res) => {
    res.json({msg:"Url not found , page 404 "})
  })
}

