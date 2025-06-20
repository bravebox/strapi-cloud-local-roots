'use strict';

const { yup } = require('@strapi/utils');
const { object, number } = yup;

// Schema for validating score in user feedback
const UserFeedbackSchema = object().shape({
  score: number()
    .min(1, 'Score must be between 1 and 5')
    .max(5, 'Score must be between 1 and 5')
    .required('Score is required'),
  // Note: relations (user, recipe) are validated in the controller
});

module.exports = {
  UserFeedbackSchema
};
