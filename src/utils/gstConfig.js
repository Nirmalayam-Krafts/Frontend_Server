export const DEFAULT_SYSTEM_GST_CONFIG = {
  gstEnabled: true,
  defaultGstRate: 18,
  defaultHsnCode: "4819 40 00",
};

export const getSystemGstConfigFromStorage = () => {
  try {
    const raw = localStorage.getItem("nirmalyam_gstConfig");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        gstEnabled: parsed.gstEnabled ?? true,
        defaultGstRate: Number(parsed.defaultGstRate ?? 18),
        defaultHsnCode: String(parsed.defaultHsnCode || "4819 40 00"),
      };
    }
  } catch (_) {}
  return DEFAULT_SYSTEM_GST_CONFIG;
};

export const getEffectiveTaxRate = (lineOrOrderTaxRate, gstConfigOverride) => {
  const config = gstConfigOverride || getSystemGstConfigFromStorage();
  if (!config.gstEnabled) return 0;
  if (lineOrOrderTaxRate != null && !isNaN(Number(lineOrOrderTaxRate)) && Number(lineOrOrderTaxRate) > 0) {
    return Number(lineOrOrderTaxRate);
  }
  return Number(config.defaultGstRate ?? 18);
};

export const getEffectiveGstRate = (product, invoiceDate) => {
  const config = getSystemGstConfigFromStorage();
  if (!config.gstEnabled) return 0;
  if (!product) return Number(config.defaultGstRate ?? 5);

  if (product.hsn_source === "custom" || product.hsnSource === "custom") {
    if (product.custom_gst_rate != null) return Number(product.custom_gst_rate);
    if (product.customGstRate != null) return Number(product.customGstRate);
  }

  if (product.gstRate != null && !isNaN(Number(product.gstRate))) {
    return Number(product.gstRate);
  }

  return Number(config.defaultGstRate ?? 5);
};
