// Event Validation
const Joi = require('joi');

module.exports.validateContactInput = async (name, email, phone, company) => {
  const contactSchema = Joi.object().keys({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().min(5).max(40).required(),
    company: Joi.string().min(3).max(30),
    phone: Joi.string().length(10).required(),
  });
  try {
    const { error } = await contactSchema.validate(
      {
        name,
        email,
        company,
        phone,
      },
      { abortEarly: false }
    );
    if (error) {
      return { isValid: false, error };
    }
    return { isValid: true };
  } catch (err) {
    console.log(err);
    return { message: 'Something went wrong !' };
  }
};

module.exports.validateContactUpdateInput = async (
  name,
  email,
  phone,
  company
) => {
  const contactSchema = Joi.object().keys({
    name: Joi.string().min(3),
    email: Joi.string().email().min(5).max(40),
    company: Joi.string().min(3).max(30),
    phone: Joi.string().length(10),
  });
  try {
    const { error } = await contactSchema.validate(
      {
        name,
        email,
        company,
        phone,
      },
      { abortEarly: false }
    );
    if (error) {
      return { isValid: false, error };
    }
    return { isValid: true };
  } catch (err) {
    console.log(err);
    return { message: 'Something went wrong !' };
  }
};
