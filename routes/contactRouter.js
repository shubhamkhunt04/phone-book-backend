const express = require('express');
const User = require('../model/User');
const Contact = require('../model/Contact');
const { verifyUser } = require('../middleware/verifyUser');
const {
  validateContactInput,
  validateContactUpdateInput,
} = require('../util/validators/contactValidator');
const { paginatedResult } = require('../middleware/pagination');

const contactRouter = express.Router();

contactRouter.post('/addcontact', verifyUser, async (req, res) => {
  const { name, email, phone, company } = req.body;
  const { isValid, error } = await validateContactInput(
    name,
    email,
    phone,
    company
  );
  if (isValid) {
    const { id } = req.decoded;
    try {
      const user = await User.findById(id);
      const contact = await Contact.create({
        name,
        email,
        phone,
        company,
      });
      if (user) {
        user.userContacts.push(contact.id);
        await user.save();
      }
      return res.json({
        payload: contact,
        message: 'Contact created successfully',
      });
    } catch (error) {
      return res.json({
        message: 'Something went wrong !',
        err: error.message,
      });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

contactRouter.get(
  '/contacts',
  verifyUser,
  paginatedResult(Contact),
  async (req, res) => {
    try {
      const { id } = req.decoded;
      const user = await User.findById(id).populate('userContacts');
      if (user) {
        return res.json({
          payload: user.userContacts,
          message: 'User Contacts',
        });
      }
      return res.json({ message: 'User not found' });
    } catch (error) {
      res.json({ message: 'Something went wrong', err: error.message });
    }
  }
);

contactRouter.get('/:contactId', verifyUser, async (req, res) => {
  try {
    const { id } = req.decoded;
    const user = await User.findById(id);
    const contactId = req.params.contactId;
    if (user) {
      // check the contact id is exist in userContacts array
      const validateUserAccess = user.userContacts.includes(contactId);
      if (validateUserAccess) {
        const contact = await Contact.findById(contactId);
        return res.json({ message: 'Contact detail', payload: contact });
      } else {
        // User is not authorize to fetch this contact
        return res.json({
          message: 'Contact not found',
        });
      }
    }
  } catch (error) {
    return res.json({ message: 'Something went wrong', err: error.message });
  }
});

contactRouter.put('/:contactId/updatecontact', verifyUser, async (req, res) => {
  const { name, email, phone, company } = req.body;
  const { isValid, error } = await validateContactUpdateInput(
    name,
    email,
    phone,
    company
  );
  if (isValid) {
    try {
      const { id } = req.decoded;
      const contactId = req.params.contactId;

      const user = await User.findById(id);

      // Not allow to update other users contact
      if (!user.userContacts.includes(contactId))
        return res.json({ message: 'Not allowed to update contact details' });

      const contact = await Contact.findById(contactId);
      if (!contact) return res.json({ message: 'Contact not found' });

      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        {
          $set: req.body,
        },
        { new: true }
      );

      await contact.save();
      res.json({ message: 'Contact details updated', payload: updatedContact });
    } catch (error) {
      return res.json({ message: 'Something went wrong', err: error.message });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

module.exports = contactRouter;
