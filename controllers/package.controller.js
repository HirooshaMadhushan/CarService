const { ServicePackage } = require('../models'); // from models/index.js

const createServicePackage = async (req, res) => {
  const { name, description, price, estimatedDuration, availableFor } = req.body;

  try {
    const newPackage = await ServicePackage.create({
      name,
      description,
      price,
      estimatedDuration,
      availableFor
    });

    res.status(201).json({
      message: 'Service package created successfully',
      data: newPackage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//package update
const updateServicePackage =async (req,res)=>{
  const {id} = req.params;
  const{name, description, price, estimatedDuration, availableFor} = req.body;

  try{
    const packageToUpdate = await ServicePackage.findByPk(id);

    if(!packageToUpdate) {
      return res.status(404).json({message:'Service package not found'});
    }
    await packageToUpdate.update({
      name,
      description,
      price,
      estimatedDuration,
      availableFor
    });

    res.status(200).json({
      message: 'Service package updated successfully',
      data: packageToUpdate
    });
  }catch(error) {
    res.status(500).json({ error: error.message });
  }

}

const getAllServicePackages = async(req,res)=>{

  try{
    const package
  }
}


module.exports = { createServicePackage,updateServicePackage };
