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

// add contact
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
        userId: user._id,
      });
      // if (user) {
      //   user.userContacts.push(contact.id);
      // }
      await user.save();
      return res.json({
        payload: contact,
        message: 'Contact created successfully',
        status: 200,
      });
    } catch (error) {
      return res.json({
        message: 'Something went wrong !',
        err: error.message,
        status: 400,
      });
    }
  } else {
    return res.json({
      message: error.details.map((e) => e.message),
      status: 400,
    });
  }
});

// fetch all contacts
contactRouter.get(
  '/contacts',
  verifyUser,
  // paginatedResult(Contact),
  async (req, res) => {
    try {
      const { id } = req.decoded;
      const user = await User.findById(id);
      if (user) {
        const userContacts = await Contact.find({ userId: id });
        return res.json({
          payload: userContacts,
          message: 'User Contacts',
          status: 200,
        });
      }
      return res.json({ message: 'User not found', status: 404 });
    } catch (error) {
      res.json({
        message: 'Something went wrong',
        err: error.message,
        status: 400,
      });
    }
  }
);

// fetch contactById
contactRouter.get('/:contactId', verifyUser, async (req, res) => {
  try {
    const { id } = req.decoded;
    const user = await User.findById(id);
    const contactId = req.params.contactId;
    if (user) {
      // check the contact id is exist in userContacts array
      // const validateUserAccess = user.userContacts.includes(contactId);

      const contact = await Contact.findById(contactId);
      if (!contact)
        return res.json({ message: 'Contact not found', status: 404 });

      // check user is Not allow to fetch contacts
      if (String(contact.userId) === id) {
        return res.json({
          message: 'Contact detail',
          payload: contact,
          status: 200,
        });
      } else {
        // user can not fetch others contacts
        return res.json({
          message: 'Contact not found',
          status: 404,
        });
      }
    }
  } catch (error) {
    return res.json({
      message: 'Something went wrong',
      err: error.message,
      status: 400,
    });
  }
});

// update contactById
contactRouter.put('/:contactId', verifyUser, async (req, res) => {
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

      // if (!user.userContacts.includes(contactId))
      // return res.json({ message: 'Not allowed to update contact details' });

      if (user) {
        const contact = await Contact.findById(contactId);
        if (!contact)
          return res.json({ message: 'Contact not found', status: 404 });

        // Not allow to update other users contact
        if (String(contact.userId) !== id)
          return res.json({
            message: 'Not allowed to update contact details',
            status: 400,
          });

        const updatedContact = await Contact.findByIdAndUpdate(
          contactId,
          {
            $set: req.body,
          },
          { new: true }
        );

        await contact.save();
        res.json({
          message: 'Contact details updated',
          payload: updatedContact,
          status: 200,
        });
      }
    } catch (error) {
      return res.json({
        message: 'Something went wrong',
        err: error.message,
        status: 400,
      });
    }
  } else {
    return res.json({ message: error.details.map((e) => e.message) });
  }
});

// delete contactById
contactRouter.delete('/:contactId', verifyUser, async (req, res) => {
  try {
    const { id } = req.decoded;
    const contactId = req.params.contactId;
    const user = await User.findById(id);

    // if (!user.userContacts.includes(contactId))
    //   return res.json({ message: 'Not allowed to delete contact details' });
    if (user) {
      const contact = await Contact.findById(contactId);
      if (!contact)
        return res.json({ message: 'Contact not found', status: 404 });

      // Not allow to update other users contact
      if (String(contact.userId) !== id)
        return res.json({
          message: 'Not allowed to update contact details',
          status: 400,
        });

      const deletedContact = await Contact.findByIdAndRemove(contactId);
      res.json({
        message: 'Contact details deleted',
        payload: deletedContact,
        status: 200,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: 'Something went wrong',
      err: error.message,
      status: 400,
    });
  }
});

module.exports = contactRouter;
