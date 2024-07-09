import { LightningElement, wire } from 'lwc';
import promptGenerations from '@salesforce/apex/SurveyController.promptGenerations';
import getEvents from '@salesforce/apex/EventController.getEvents';

export default class DdSurvey extends LightningElement {
    eventName = 'Dubai Dreamin';
    selectedEvent;
    surveyQuestions = [];
    visibleQuestions = [];
    error;
    isLoading = false;
    showGenerateSurveyPage = false
    isModalOpen = false;
    modalQuestion = {};
    currentPage = 1;
    totalPages = 1;

    pageSize = 2;
     eventOptions = [];



 @wire(getEvents)
    wiredEvents({ error, data }) {
        if (data) {
            this.eventData = data
            this.eventOptions = data.map(event => {
                return { 
                    label: event.Name, 
                    // value: event.Id 
                    value: event.Name 
                };
            });
        
            console.log(' eventData :',  JSON.stringify(this.eventData ));
        


        } else if (error) {
            console.error('Error fetching events:', error);
        }
    }

    handleEventNameChange(event) {
        this.eventName = event.target.value;
      
        console.log('eventName : ',this.eventName);
            console.log(' eventData :',  JSON.stringify(this.eventData ));
        this.selectedEvent = this.eventData.find(event => event.Name === this.eventName);
          console.log('selectedEvent : ',this.selectedEvent);
       this.showGenerateSurveyPage= true
    }



    async handleGenerateSurvey() {
        this.isLoading = true; // Start loader
        const prompt = `Generate a JSON list of  survey questions for the ${this.eventName} event. 
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
            this.totalPages = Math.ceil(this.surveyQuestions.length / this.pageSize);
            this.updateVisibleQuestions();
            console.log('questions : ', JSON.stringify(this.surveyQuestions));
        } catch (error) {
            this.error = 'Error generating survey: ' + error.body.message;
            console.error('Error generating survey:', error);
        } finally {
            this.isLoading = false; // Stop loader
        }
    }

    updateVisibleQuestions() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.visibleQuestions = this.surveyQuestions.slice(startIndex, endIndex);
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateVisibleQuestions();
        }
    }
    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateVisibleQuestions();
        }
       
    }

    handleEditClick(event) {
        const questionId = event.target.dataset.questionid;
        this.modalQuestion = JSON.parse(JSON.stringify(this.surveyQuestions.find(question => question.id === parseInt(questionId))));
        this.isModalOpen = true;
    }

    handleModalQuestionChange(event) {
        this.modalQuestion.question = event.target.value;
    }

    handleModalOptionChange(event) {
        const index = event.target.dataset.index;
        this.modalQuestion.options[index].label = event.target.value;
    }

    handleSaveModal() {
        const index = this.surveyQuestions.findIndex(question => question.id === this.modalQuestion.id);
        if (index !== -1) {
            this.surveyQuestions[index] = { ...this.modalQuestion };
        }
        this.updateVisibleQuestions();
        this.closeModal();
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleSubmit() {
        // Handle survey submission
        console.log('submitted: ', JSON.stringify(this.surveyQuestions));
    }
}