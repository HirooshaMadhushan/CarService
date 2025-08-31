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
    const package = await ServicePackage.findAll();
    res.status(200).json({
      message: 'Service packages retrieved successfully',
      data: package
    });
  } catch(error){
    res.status(500).json({ error: error.message });
  
  }
}

const deleteServicePackage =  async(req,res)=>{
  const {id}= req.params;
  try{
    const packageToDelete = await ServicePackage.findByPk(id);

    if(!packageToDelete){
      return res.status(404).json({message: 'Service package not found'});
    }
    await packageToDelete.destroy();
    res.status(200).json({message:'Service package deleted successfully'});
  }catch(error) {
    res.status(500).json({ error: error.message });
  }
}

const getServicePackageById = async (req, res) => {
  const { id } = req.params;

  try {
    const servicePackage = await ServicePackage.findByPk(id);

    if (!servicePackage) {
      return res.status(404).json({ message: 'Service package not found' });
    }

    res.status(200).json({
      message: 'Service package retrieved successfully',
      data: servicePackage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { createServicePackage,updateServicePackage,getAllServicePackages, deleteServicePackage,getServicePackageById };
