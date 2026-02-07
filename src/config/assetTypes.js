const assetTypes = {
  id_card: {
    label: "ID Card",
    view: "grid",
    allowedFormats: ["PNG", "PDF"],
    metadataSchema: [
      { name: "employeeName", label: "Employee Name", type: "text" },
      { name: "designation", label: "Designation", type: "text" },
      { name: "expiryDate", label: "Expiry Date", type: "date" }
    ]
  },
  poster: {
    label: "Poster",
    view: "grid",
    metadataSchema: [
      { name: "festival", label: "Festival", type: "text" },
      { name: "size", label: "Size", type: "text" }
    ]
  },
  logo: {
    label: "Logo",
    view: "grid",
    metadataSchema: [
      { name: "brandVariant", label: "Brand Variant", type: "text" },
      { name: "isSymbolOnly", label: "Symbol Only", type: "checkbox" }
    ]
  },
  other: {
    label: "Other Asset",
    view: "grid",
    metadataSchema: []
  }
};

module.exports = assetTypes;
