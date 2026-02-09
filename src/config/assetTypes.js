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
  visiting_card: {
    label: "Visiting Card",
    view: "grid",
    metadataSchema: [
      { name: "personName", label: "Person Name", type: "text" },
      { name: "firmName", label: "Firm Name", type: "text" }
    ]
  },
  tshirt: {
    label: "T-Shirt",
    view: "grid",
    metadataSchema: [
      { name: "size", label: "Size", type: "text" },
      { name: "color", label: "Color", type: "text" }
    ]
  },
  envelop: {
    label: "Envelop",
    view: "grid",
    metadataSchema: [
      { name: "size", label: "Size", type: "text" }
    ]
  },
  banner: {
    label: "Banner",
    view: "grid",
    metadataSchema: [
      { name: "dimensions", label: "Dimensions", type: "text" },
      { name: "material", label: "Material", type: "text" }
    ]
  },
  pen: {
    label: "Pen",
    view: "grid",
    metadataSchema: [
      { name: "brand", label: "Brand", type: "text" }
    ]
  },
  glass: {
    label: "Glass",
    view: "grid",
    metadataSchema: [
      { name: "type", label: "Glass Type", type: "text" }
    ]
  },
  receipt: {
    label: "Receipt",
    view: "grid",
    metadataSchema: [
      { name: "receiptNo", label: "Receipt No", type: "text" },
      { name: "date", label: "Date", type: "date" }
    ]
  },
  bag: {
    label: "Bag",
    view: "grid",
    metadataSchema: [
      { name: "type", label: "Bag Type", type: "text" },
      { name: "material", label: "Material", type: "text" }
    ]
  },
  other: {
    label: "Other Asset",
    view: "grid",
    metadataSchema: []
  }
};

module.exports = assetTypes;
