// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildDetailView)
);

// Route to build management view
router.get(
  "/",
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.buildManagement)
);

// Route to show add classification form
router.get(
  "/add-classification",
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to show add inventory form
router.get(
  "/add-inventory", 
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to get inventory items by classification_id
router.get(
  "/getInventory/:classification_id", 
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.getInventoryJSON)
);

// Process the add classification request
router.post(
  "/add-classification",
  utilities.inventoryAdminOnly,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Process the add inventory request
router.post(
  "/add-inventory",
  utilities.inventoryAdminOnly,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to show edit inventory form
router.get(
  "/edit/:inv_id",
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.editInventoryView)
)

// Process the update inventory request
router.post(
  "/update/",
  utilities.inventoryAdminOnly,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Route to show delete confirmation form
router.get(
  "/delete/:inv_id",
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.deleteInventoryView)
)

// Process the delete inventory request
router.post(
  "/delete",
  utilities.inventoryAdminOnly,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;