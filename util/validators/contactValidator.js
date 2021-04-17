// Event Validation
const Joi = require("joi");

module.exports.validateContactInput = async (name, email, phone,company) => {
  const eventSchema = Joi.object().keys({
    name: Joi.string().min(3).required(),
    email:Joi.string().email().min(5).max(20).required(),
    company: Joi.string().min(3).max(30),
    phone:Joi.string().length(10).required()
  });
  try {
    const { error } = await eventSchema.validate(
      {
        name,
        email,
        company,
        phone
      },
      { abortEarly: false }
    );
    if (error) {
      return { isValid: false, error };
    }
    return { isValid: true };
  } catch (err) {
    console.log(err);
    return { message: "Something went wrong !" };
  }
};
