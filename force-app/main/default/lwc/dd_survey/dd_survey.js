import { LightningElement, track } from 'lwc';
import promptGenerations from '@salesforce/apex/SurveyController.promptGenerations';

export default class DdSurvey extends LightningElement {
    eventName = 'Dubai Dreamin';
    surveyQuestions = [];
    error;

    textType = false;
    multiSelectType = false;
    radioType = false;
    numberType = false;
    isLoading =false
    handleEventNameChange(event) {
        this.eventName = event.target.value;
    }

//     handleGenerateSurvey() {
//        const prompt = `Generate a list of Survey suggestions for ${this.eventName} event based on Salesforce. Response should show the data type of each question and options if those are needed. Response should be in the JSON format.`;
//  //const prompt = `Generate a JSON list of survey questions for the ${this.eventName} event, including data types and options if needed. Add boolean keys indicating the data type: multiSelectType, checkboxType, radioType, numberType, and textType.'`;
        
//       promptGenerations({ prompt })
//             .then(result => {
//                 this.surveyQuestions = JSON.parse(result).survey_questions;
//                 this.surveyQuestions.forEach(question => {
//                     if (question.options) {
//                         let options = [];
//                         question.options.forEach(option => {
//                             options.push({ label: option, value: option });
//                         });
//                         question.options = options;
//                     }

                    
//                 });
//                 console.log('questions : ', JSON.stringify(this.surveyQuestions));
//             })
//             .catch(error => {
//                 this.error = 'Error generating survey: ' + error.body.message;
//             });
//     }

       async handleGenerateSurvey() {
        this.isLoading = true; // Start loader
        // const prompt = `Generate a list of Survey suggestions for ${this.eventName} event based on Salesforce. Response should show the data type of each question and options if those are needed. Response should be in the JSON format.`;
        const prompt = `Generate a JSON list of survey questions for the ${this.eventName} event. 
        The response, called surveyQuestions, should include the following details:
        - Question
        - Id
        - Data type (text, radio, multi-select, or number)
        - if data type multi-select or radio provide it's options as well
        - Boolean keys indicating the data type: textType, radioType, multiSelectType, and numberType.`;
        
    try {
        const result = await promptGenerations({ prompt });
        console.log('Result: ', result);
        this.surveyQuestions = JSON.parse(result).surveyQuestions;
        this.surveyQuestions.forEach(question => {
            if (question.options) {
                question.options = question.options.map(option => ({ label: option, value: option }));
            }

           
        });
        console.log('questions : ', JSON.stringify(this.surveyQuestions));
    } catch (error) {
        this.error = 'Error generating survey: ' + error.body.message;
    }
    finally {
        this.isLoading = false; // Stop loader
    }
}
    handleSubmit() {
        // Implement your submit logic here
    }
}
