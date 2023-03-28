require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const ejs = require('ejs');
const { Onfido, Region, OnfidoApiError } = require("@onfido/api");



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
    const applicantId = applicant.id;

    const generateSdkToken = await onfido.sdkToken.generate({
      applicantId: applicantId,
      referrer: "*://*/*"
    });

  
    const workflowRun = await onfido.workflowRun.create({
      applicantId: applicant.id,
      workflowId: workflowId
    });
    

    const workflowRunId = workflowRun.id;
   
    res.render('index', { 
      sdkToken: generateSdkToken, 
      workflowRunId: workflowRunId 
      
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
