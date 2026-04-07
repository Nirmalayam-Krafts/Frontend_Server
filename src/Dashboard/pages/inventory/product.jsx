import React, { useMemo, useState } from "react";
import { Layout } from "../../components/common/Layout";
import { Card, Button, Badge, Input, Modal } from "../../components/ui";
import ProductForm from "../../components/forms/ProductForm";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Package,
  Boxes,
  Ruler,
  Wallet,
  Layers3,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/Adminauth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetAllProducts } from "../../../../hook/product";

const Product = () => {
  const { axiosInstance } = useAuthContext();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [], isLoading } = useGetAllProducts({ search });

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const query = search.toLowerCase();
      return (
        item?.name?.toLowerCase().includes(query) ||
        item?.category?.toLowerCase().includes(query) ||
        item?.sku?.toLowerCase().includes(query) ||
        item?.bagType?.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const activeCount = products.filter((item) => item.isActive).length;
  const customCount = products.filter((item) => item.bagType === "custom").length;
  const totalRawMappings = products.reduce(
    (sum, item) => sum + (item?.rawMaterials?.length || 0),
    0
  );

  const handleAddProduct = async (data) => {
    const loadingToast = toast.loading("Creating product...");

    try {
      const response = await axiosInstance.post("/products", data);
      const createdProduct = response?.data?.data;
      console.log(response)
      toast.success("Product created successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (createdProduct) {
        setSelectedProduct(createdProduct);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create product",
        { id: loadingToast }
      );
    }
  };

  const handleUpdateProduct = async (data) => {
    const loadingToast = toast.loading("Updating product...");

    try {
      const response = await axiosInstance.patch(
        `/products/${editingProduct._id || editingProduct.id}`,
        data
      );

      const updatedProduct = response?.data?.data;

      toast.success("Product updated successfully 🎉", {
        id: loadingToast,
      });

      setShowModal(false);
      setEditingProduct(null);

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (
        selectedProduct &&
        (selectedProduct._id === (editingProduct._id || editingProduct.id) ||
          selectedProduct.id === (editingProduct._id || editingProduct.id))
      ) {
        setSelectedProduct(updatedProduct);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update product",
        { id: loadingToast }
      );
    }
  };

  const handleDeleteProduct = async (id) => {
    const loadingToast = toast.loading("Deleting product...");

    try {
      await axiosInstance.delete(`/products/${id}`);

      toast.success("Product deleted successfully", {
        id: loadingToast,
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllProducts"],
      });

      if (selectedProduct?._id === id || selectedProduct?.id === id) {
        setShowDetailPanel(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete product",
        { id: loadingToast }
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
  initial={{ opacity: 0, y: -18 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-xl ring-1 ring-white/10"
>
  {/* subtle overlay glow */}
  <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

  <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
    
    {/* LEFT CONTENT */}
    <div className="max-w-3xl">
      <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
        Product Control Panel
      </div>

      <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
        Product Management
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 md:text-base">
        Create products with full specifications, dimensions, pricing setup,
        and raw material mapping for accurate bag estimation.
      </p>
    </div>

    {/* RIGHT CTA */}
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end xl:w-auto">
      
      <Button
        icon={Plus}
        onClick={() => {
          setEditingProduct(null);
          setShowModal(true);
        }}
        className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-6 py-3 text-sm font-bold text-emerald-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-xl"
      >
        Add New Product
      </Button>

    </div>
  </div>
</motion.div> 

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Total Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Active Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activeCount}
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Custom Bags
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {customCount}
                </p>
              </div>
              <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
                <Ruler className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Raw Material Mappings
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalRawMappings}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Layers3 className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-4"
        >
          <Input
            placeholder="Search by product name, category, SKU, or bag type..."
            value={search}
            icon={Search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Products Overview</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredProducts.length} products
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Dimensions
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Base Price
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Materials
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.bagType}</p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item.category}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          {item.sku}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item?.dimensions?.length} × {item?.dimensions?.width} ×{" "}
                          {item?.dimensions?.height} {item?.dimensions?.unit}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                          ₹{Number(item.basePrice || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {item?.rawMaterials?.length || 0}
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={item.isActive ? "success" : "danger"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(item);
                                setShowDetailPanel(true);
                              }}
                              className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100"
                              title="View Product"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingProduct(item);
                                setShowModal(true);
                              }}
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(item._id || item.id)}
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filteredProducts.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        <Modal
          isOpen={showModal}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        >
          <ProductForm
            initialData={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          />
        </Modal>

        {showDetailPanel && selectedProduct && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setShowDetailPanel(false)}
            />

            <motion.div
              className="relative h-screen w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Product Detail</h2>
                  <button
                    onClick={() => setShowDetailPanel(false)}
                    className="text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProduct.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{selectedProduct.sku}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Category
                    </p>
                    <p className="mt-1 text-gray-900">{selectedProduct.category}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Bag Type
                    </p>
                    <p className="mt-1 text-gray-900">{selectedProduct.bagType}</p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">
                      Description
                    </p>
                    <p className="mt-1 text-gray-900">
                      {selectedProduct.description || "No description added"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Dimensions
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Length</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.dimensions?.length}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Width</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.dimensions?.width}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Height</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.dimensions?.height}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Unit</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.dimensions?.unit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold uppercase text-gray-500">
                        Pricing
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Base Price</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹{Number(selectedProduct?.basePrice || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Pricing Mode</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {selectedProduct?.estimationConfig?.pricingMode || "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Labor Cost</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          ₹
                          {Number(
                            selectedProduct?.estimationConfig?.laborCostPerBag || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Margin %</p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {Number(
                            selectedProduct?.estimationConfig?.marginPercent || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase text-gray-500">
                      Raw Materials
                    </p>

                    <div className="space-y-3">
                      {(selectedProduct?.rawMaterials || []).length > 0 ? (
                        selectedProduct.rawMaterials.map((item, index) => (
                          <div key={index} className="rounded-xl bg-gray-50 p-3">
                            <p className="font-semibold text-gray-900">
                              {item.rawMaterialName}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              Type: {item.rawMaterialType}
                            </p>
                            <p className="text-sm text-gray-600">
                              Qty / Bag: {item.requiredQuantityPerBag} {item.unit}
                            </p>
                            <p className="text-sm text-gray-600">
                              Wastage: {item.wastagePercent || 0}%
                            </p>
                            <p className="text-sm text-gray-600">
                              Usage Type: {item.usageType}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.notes || "No notes"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No raw materials mapped.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailPanel(false)}
                  >
                    Close
                  </Button>

                  <Button
                    onClick={() => {
                      setEditingProduct(selectedProduct);
                      setShowModal(true);
                      setShowDetailPanel(false);
                    }}
                  >
                    Edit Product
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Product;