import { LightningElement, track } from 'lwc';
import promptGenerations from '@salesforce/apex/SurveyController.promptGenerations';

export default class DdSurvey extends LightningElement {
    @track eventName = 'Dubai Dreamin';
    @track surveyQuestions = [];
    @track error;
    @track isLoading = false;
    @track isModalOpen = false;
    @track modalQuestion = {};
    @track modalOptions = '';

    textType = false;
    multiSelectType = false;
    radioType = false;
    numberType = false;

    handleEventNameChange(event) {
        this.eventName = event.target.value;
    }

    async handleGenerateSurvey() {
        this.isLoading = true; // Start loader
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
            console.error('Error generating survey:', error);
        } finally {
            this.isLoading = false; // Stop loader
        }
    }

    handleEditClick(event) {
        console.log('clicked');
        const questionId = event.target.dataset.questionid;
        this.modalQuestion = this.surveyQuestions.find(question => question.id === parseInt(questionId));
        this.modalOptions = this.modalQuestion.options ? this.modalQuestion.options.map(option => option.label).join(', ') : '';
        console.log('question selected: ', JSON.stringify(this.modalQuestion));
        this.isModalOpen = true;
    }

    handleModalQuestionChange(event) {
        this.modalQuestion.question = event.target.value;
    }

    handleModalOptionsChange(event) {
        this.modalOptions = event.target.value;
    }

    handleSaveModal() {
        if (this.modalOptions) {
            this.modalQuestion.options = this.modalOptions.split(',').map(option => ({ label: option.trim(), value: option.trim() }));
        } else {
            this.modalQuestion.options = [];
        }
        const index = this.surveyQuestions.findIndex(question => question.id === this.modalQuestion.id);
        if (index !== -1) {
            this.surveyQuestions[index] = { ...this.modalQuestion };
        }
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
