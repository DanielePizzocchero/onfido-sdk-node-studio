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
    const apiToken = req.body.apiToken

    const onfido = new Onfido({
      //apiToken: process.env.ONFIDO_API_TOKEN,
      apiToken: apiToken,
      region: Region.EU
    });

    const applicant = await onfido.applicant.create({
      firstName: firstName,
      lastName: lastName, 
    });
    
    //const applicantId = applicant.id;

    //console.log("applicant uuid: " + applicant.id);
    console.log("applicant uuid: " + "1bad8436-e774-4f9a-8c4c-7eb250319611");

    

    const generateSdkToken = await onfido.sdkToken.generate({
      //applicantId: applicant.id, 

      applicantId: "1bad8436-e774-4f9a-8c4c-7eb250319611,
      referrer: "*://*/*"
    });

  
    const workflowRun = await onfido.workflowRun.create({
      //applicantId: applicant.id,
      applicantId: "1bad8436-e774-4f9a-8c4c-7eb250319611",
      workflowId: workflowId
    });
    

    const workflowRunId = workflowRun.id;
   
    res.render('index', { 
      sdkToken: generateSdkToken, 
      workflowRunId: workflowRunId,
     
      
    });
  } catch (error) {
    if (error instanceof OnfidoApiError) {
      console.log(error.message);
      console.log(error.type);
      console.log(error.isClientError());
    } else {
      console.log(error.message);
    }
  }
});

const port = 3000;


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
