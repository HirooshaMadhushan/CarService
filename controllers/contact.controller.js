const { Contact } = require('../models');

const createContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    const contactEntry = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread' // default
    });

    return res.status(201).json({
      message: 'Contact message saved successfully',
      data: contactEntry
    });
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateContactStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const contactEntry = await Contact.findByPk(id);

    if (!contactEntry) {
      return res.status(404).json({ message: 'Contact entry not found' });
    }

    await contactEntry.update({ status });

    return res.status(200).json({
      message: 'Contact status updated successfully',
      data: contactEntry
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }    
}; 

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll();   
    return res.status(200).json({
      message: 'Contacts retrieved successfully',
      data: contacts
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const contactEntry = await Contact.findByPk(id);

    if (!contactEntry) {
      return res.status(404).json({ message: 'Contact entry not found' });
    }

    return res.status(200).json({
      message: 'Contact entry retrieved successfully',
      data: contactEntry
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const contactEntry = await Contact.findByPk(id);

    if (!contactEntry) {
      return res.status(404).json({ message: 'Contact entry not found' });
    }

    await contactEntry.destroy();

    return res.status(200).json({
      message: 'Contact entry deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};  
module.exports = { createContact, updateContactStatus, getAllContacts, getContactById, deleteContact };
