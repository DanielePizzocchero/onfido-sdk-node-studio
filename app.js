require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const ejs = require('ejs');
const { Onfido, Region, OnfidoApiError } = require("@onfido/api");

app.use(express.static(__dirname+'/public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit', async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const workflowId = req.body.workflowId;
    const apiToken = req.body.apiToken;
    let applicantId = req.body.applicantId;
    const disableWelcomeScreen = req.body.disableWelcomeScreen;
    let disableWelcomeScreenVal = "";

    console.log(`applicantId at start ${applicantId}`);
    console.log(`disableWelcomeScreen at start ${disableWelcomeScreen}`);

    if (disableWelcomeScreen == "Y"){
      disableWelcomeScreenVal =  true;
    }else{
      disableWelcomeScreenVal =  false;
    }

    if (applicantId == ""){
      console.log(`applicantId at start is empty ${applicantId}`);
    }

    console.log(`disableWelcomeScreenVal  ${disableWelcomeScreenVal}`);

    const onfido = new Onfido({
      //apiToken: process.env.ONFIDO_API_TOKEN,
      apiToken: apiToken,
      region: Region.EU
    });

    if ((applicantId == "")){
      const applicant = await onfido.applicant.create({
        firstName: firstName,
        lastName: lastName, 
      });
      applicantId = applicant.id;
    }
    

    
    console.log("applicant uuid: " + applicantId);
    
    const generateSdkToken = await onfido.sdkToken.generate({
      applicantId: applicantId, 
      referrer: "*://*/*"
    });
  
    const workflowRun = await onfido.workflowRun.create({
      applicantId: applicantId,
      workflowId: workflowId
    });
    

    const workflowRunId = workflowRun.id;
   
    res.render('index', { 
      sdkToken: generateSdkToken, 
      workflowRunId: workflowRunId,
      disableWelcomeScreenVal: disableWelcomeScreenVal
     
      
    });
  } catch (error) {
    if (error instanceof OnfidoApiError) {
      console.log(`error.message ${error.message}`);
      console.log(`error.type ${error.type}`);
      console.log(`error.isClientError() ${error.isClientError()}`);
    } else {
      console.log(`error.message ${error.message}`);
    }
  }
});

const port = 3000;


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
